var key = [2815074099, 1725469378, 4039046167, 874293617, 3063605751, 3133984764, 4097598161, 3620741625];
var iv = sjcl.codec.hex.toBits("7475383967656A693334307438397532");
sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]();
var isLoaded = false;

function colorHack() {
  $('.jscolor').each(function () {
    $(this).focus();
  });

  $("input").blur();
}

function colorConverter(colorhex, mode) {
  var mode = ((mode === undefined) ? false : mode);
  if (mode) {

    var hexColor = colorhex.toString(16).substring(2).toUpperCase();
    return hexColor;
  }
  else {
    var colorfos;
    var x = colorhex.substring(0, 0) + "FF" + colorhex.substring(0);
    colorfos = parseInt(x, 16);
    return colorfos;
  }
}

//lazy code addition, but I believe it is beneficial and not too invasive.
function numberCheckHelper() {
  $("input[type='number']").each(function () {
    if ($(this).val === undefined || $(this).val().trim().length == 0 || $(this).val() == null) {
      var a = $(this).attr("min");
      if (a === undefined) a = 0;
      $(this).val(a);
    }
  });
  setTimeout(numberCheckHelper, 3000);
}

function colortofos() {
  var colorhex = document.getElementsByClassName("jscolor")[0].value;
  $(".value1").html(colorConverter(colorhex));
}

$(document).ready(function () {
  numberCheckHelper();
  if (window.location.href.indexOf("?preset=") > -1 && window.location.href.indexOf("?savename=") > -1) {
    urlPreset = window.location.href.substring(window.location.href.indexOf("?preset=") + 8, window.location.href.indexOf("?savename="));
    urlSaveName = window.location.href.substring(window.location.href.indexOf("?savename=") + 10);
    preset(urlPreset, urlSaveName);
  }
});

function handleFileSelect(evt) {
  try {
    evt.stopPropagation();
    evt.preventDefault();
    var f = evt.target.files[0];
    var fileName = f.name;
    if (f.size > 3e7) {
      throw "File exceeds maximum size of 30MB"
    }
    if (f) {
      var reader = new FileReader;
      if (evt.target.id == "sav_file") {
        reader.onload = function (evt2) {
          try {
            decrypt(evt2, fileName, reader.result)
          } catch (e) {
            alert("Error: " + e)
          }
        };
        reader.readAsText(f)
      } else if (evt.target.id == "json_file") {
        reader.onload = function (evt2) {
          try {
            encrypt(evt2, fileName, reader.result)
          } catch (e) {
            alert("Error: " + e)
          }
        };
        reader.readAsText(f)
      }
    }
  } catch (e) {
    alert("Error: " + e)
  } finally {
    evt.target.value = null
  }
}

function decrypt(evt, fileName, base64Str) {
  var cipherBits = sjcl.codec.base64.toBits(base64Str);
  var prp = new sjcl.cipher.aes(key);
  var plainBits = sjcl.mode.cbc.decrypt(prp, cipherBits, iv);
  var jsonStr = sjcl.codec.utf8String.fromBits(plainBits);
  try {
    document.getElementById("presetSaveName").value = fileName;
    edit(fileName, JSON.parse(jsonStr));
  } catch (e) {
    throw "Decrypted file does not contain valid JSON: " + e
  }
}

function encrypt(fileName, save) {
  var compactJsonStr = JSON.stringify(save);
  var plainBits = sjcl.codec.utf8String.toBits(compactJsonStr);
  var prp = new sjcl.cipher.aes(key);
  var cipherBits = sjcl.mode.cbc.encrypt(prp, plainBits, iv);
  var base64Str = sjcl.codec.base64.fromBits(cipherBits);
  var blob = new Blob([base64Str], {
    type: "text/plain"
  });
  saveAs(blob, fileName.replace(".txt", ".sav").replace(".json", ".sav"))
}

document.getElementById("sav_file").addEventListener("change", function (e) {
  $('.box').removeClass('hover').addClass('ready');
  $('.instructions').hide();
  handleFileSelect(e);
}, false);

document.ondragover = document.ondrop = function (e) {
  e.preventDefault();
  return false;
};

$('body .container .box')
  .on('dragover', function (e) {
    $('.box').addClass('hover');
    $('.instructions').hide();
  })
  .on('dragleave', function (e) {
    $('.box').removeClass('hover');
    $('.instructions').show();
  })
  .on('drop', function (e) {
    $('.box').removeClass('hover').addClass('ready');
    $('.instructions').hide();
    var file = e.originalEvent.dataTransfer.files[0],
      fileName = file.name,
      reader = new FileReader();
    reader.onload = function (ev) {
      try {
        decrypt(ev, fileName, reader.result);
      } catch (err) {
        alert("Error: " + err);
      }
    };
    reader.readAsText(file);
    e.preventDefault();
    return false;
  });


// Modifications
function edit(fileName, save) {
  isLoaded = true;
  var scope = angular.element($('body').get(0)).scope();
  scope.$apply(function () {
    scope.save = save;
    scope.fileName = fileName;
  });
}

var app = angular.module('shelter', []);

app.controller('dwellerController', function ($scope) {
  $scope.section = 'vault';

  $scope.fileName = '';
  $scope.dweller = {};
  $scope.statsName = ['Unknown', 'S.', 'P.', 'E.', 'C.', 'I.', 'A.', 'L.'];
  $scope.other = {};
  $scope.wastelandTeams = [];
  $scope.wastelandTeams2 = [];
  $scope.team = {};
  $scope.actor = {};

  var _save = {},
    _lunchboxCount = 0,
    _handyCount = 0,
    _petCarrierCount = 0,
    _starterPackCount = 0,
    _vaultName = -1,
    _skinColor = null,
    _hairColor = null,
    _firstName = null,
    _otherName = null;

  Object.defineProperty($scope, 'firstName', {
    get: function () {
      return _firstName
    },
    set: function (val) {
      _firstName = val;
      if (val.trim().length == 0) {
        $scope.dweller.name = "Vault Dweller";
      }
      else {
        $scope.dweller.name = val;
      }
    }
  });

  Object.defineProperty($scope, 'otherName', {
    get: function () {
      return _otherName
    },
    set: function (val) {
      _otherName = val;
      if (val.trim().length == 0) {
        $scope.other.name = "Vault Other";
      }
      else {
        $scope.other.name = val;
      }
    }
  });

  Object.defineProperty($scope, 'vaultName', {
    get: function () {
      if (_vaultName == -1 && $scope.save !== undefined && $scope.save.vault !== undefined) _vaultName = parseInt($scope.save.vault.VaultName);
      return _vaultName
    },
    set: function (val) {
      if (val == null) val = 0;
      _vaultName = val;
      var str = "" + val;
      while (str.length < 3) str = "0" + str;
      $scope.save.vault.VaultName = str;
    }
  });

  Object.defineProperty($scope, 'skinColor', {
    get: function () {
      return _skinColor
    },
    set: function (val) {
      _skinColor = val;
      $scope.dweller.skinColor = colorConverter(val);
    }
  });

  Object.defineProperty($scope, 'hairColor', {
    get: function () {
      return _hairColor
    },
    set: function (val) {
      _hairColor = val;
      $scope.dweller.hairColor = colorConverter(val);
    }
  });

  Object.defineProperty($scope, 'save', {
    get: function () {
      return _save
    },
    set: function (val) {
      _save = val;
      extractCount();
      extractTeams();
    }
  });

  Object.defineProperty($scope, 'lunchboxCount', {
    get: function () {
      return _lunchboxCount
    },
    set: function (val) {
      _lunchboxCount = val;
      updateCount();
    }
  });

  Object.defineProperty($scope, 'handyCount', {
    get: function () {
      return _handyCount
    },
    set: function (val) {
      _handyCount = val;
      updateCount();
    }
  });

  Object.defineProperty($scope, 'petCarrierCount', {
    get: function () {
      return _petCarrierCount
    },
    set: function (val) {
      _petCarrierCount = val;
      updateCount();
    }
  });

  Object.defineProperty($scope, 'starterPackCount', {
    get: function () {
      return _starterPackCount
    },
    set: function (val) {
      _starterPackCount = val;
      updateCount();
    }
  });

  Object.defineProperty($scope, 'elapsedTimeAliveExploring', {
    get: function () {
      return $scope.team.elapsedTimeAliveExploring;
    },
    set: function (val) {
      $scope.team.elapsedTimeAliveExploring = val;
      updateTeam();
    }
  });

  Object.defineProperty($scope, 'returnTripDuration', {
    get: function () {
      return $scope.team.returnTripDuration;
    },
    set: function (val) {
      $scope.team.returnTripDuration = val;
      updateTeam();
    }
  });

  Object.defineProperty($scope, 'teamEquipment', {
    get: function () {
      return $scope.team.teamEquipment;
    },
    set: function (val) {
      $scope.team.teamEquipment = val;
      updateTeam();
    }
  });


  $scope.editDweller = function (dweller) {
    $scope.dweller = dweller;
    _firstName = $scope.dweller.name;
    _skinColor = colorConverter($scope.dweller.skinColor, true);
    _hairColor = colorConverter($scope.dweller.hairColor, true);
    setTimeout(colorHack, 200);
  };

  $scope.editOthers = function (other) {
    $scope.other = other;
    _otherName = $scope.other.name;
  };

  $scope.maxhappinessAll = function () {
    var sum2 = Object.keys($scope.save.dwellers.dwellers).length;
    for (i = 0; i < sum2; i++)
      $scope.save.dwellers.dwellers[i].happiness.happinessValue = 100;
    alert("Maxed All Dwellers Happiness!");
  };

  $scope.healAll = function () {
    var sum2 = Object.keys($scope.save.dwellers.dwellers).length;
    for (i = 0; i < sum2; i++) {
      $scope.save.dwellers.dwellers[i].health.radiationValue = 0;
      $scope.save.dwellers.dwellers[i].health.healthValue = $scope.save.dwellers.dwellers[i].health.maxHealth;
    }
    alert("Healed All Dwellers!");
  };

  $scope.maxSpecialAll = function () {
    var sum2 = Object.keys($scope.save.dwellers.dwellers).length;
    for (i = 0; i < sum2; i++)
      for (i2 = 0; i2 < 8; i2++)
        $scope.save.dwellers.dwellers[i].stats.stats[i2].value = 10;
    alert("Maxed All Dwellers Stats!");
  };

  $scope.maxSpecial = function () {
    $scope.dweller.stats.stats[1].value = 10;
    $scope.dweller.stats.stats[2].value = 10;
    $scope.dweller.stats.stats[3].value = 10;
    $scope.dweller.stats.stats[4].value = 10;
    $scope.dweller.stats.stats[5].value = 10;
    $scope.dweller.stats.stats[6].value = 10;
    $scope.dweller.stats.stats[7].value = 10;
  };

  $scope.removeRocks = function () {
    $scope.save.vault.rocks = [];
    alert("Removed Rocks!");
  };

  $scope.closeDweller = function (dweller) {
    $scope.dweller = {};
  };

  $scope.editTeam = function (team) {
    $scope.team = team;
  };

  $scope.closeTeam = function () {
    $scope.team = {};
  };

  $scope.closeOther = function () {
    $scope.other = {};
  };

  $scope.download = function () {
    encrypt(document.getElementById("presetSaveName").value, $scope.save);
  };

  $scope.clearemergency = function () {
    var sum2 = Object.keys($scope.save.vault.rooms).length;
    for (i = 0; i < sum2; i++) {
      $scope.save.vault.rooms[i].currentStateName = "Idle";
    }
    alert("Cleared Emergency on all rooms!");
  };

  $scope.acceptdwellersWaiting = function () {
    $scope.save.dwellerSpawner.dwellersWaiting = [];
    alert("Accepted all Dwellers that was Waiting!");
  };

  $scope.unlockthemes = function () {
    var sum2 = Object.keys($scope.save.survivalW.collectedThemes.themeList).length;
    for (i = 0; i < sum2; i++) {
      $scope.save.survivalW.collectedThemes.themeList[i].extraData.partsCollectedCount = 9;
      $scope.save.survivalW.collectedThemes.themeList[i].extraData.IsNew = true;
    }
    alert("All themes unlocked!");
  };

  $scope.colortofos = colortofos;

  $scope.unlockrooms = function () {
    $scope.save.unlockableMgr.objectivesInProgress = [];
    $scope.save.unlockableMgr.completed = [];
    $scope.save.unlockableMgr.claimed = ["StorageUnlock",
      "MedbayUnlock",
      "SciencelabUnlock",
      "OverseerUnlock",
      "RadioStationUnlock",
      "WeaponFactoryUnlock",
      "GymUnlock",
      "DojoUnlock",
      "ArmoryUnlock",
      "ClassUnlock",
      "OutfitFactoryUnlock",
      "CardioUnlock",
      "BarUnlock",
      "GameRoomUnlock",
      "BarberShopUnlock",
      "PowerPlantUnlock",
      "WaterroomUnlock",
      "HydroponicUnlock",
      "NukacolaUnlock",
      "DesignFactoryUnlock"];
    alert("Unlocked Rooms!");
  };

  $scope.unlockrecipes = function () {
    $scope.save.survivalW.recipes = [
      "Shotgun_Rusty",
      "Railgun",
      "LaserPistol_Focused",
      "PlasmaThrower_Boosted",
      "PlasmaThrower_Overcharged",
      "PipePistol_LittleBrother",
      "CombatShotgun_Hardened",
      "Flamer_Rusty",
      "LaserRifle_Tuned",
      "HuntingRifle_OlPainless",
      "PlasmaRifle_Focused",
      "PipeRifle",
      "JunkJet_Tactical",
      "InstitutePistol_Improved",
      "BBGun_RedRocket",
      "032Pistol_Hardened",
      "InstitutePistol_Apotheosis",
      "InstitutePistol_Scattered",
      "InstituteRifle_Excited",
      "PipeRifle_Long",
      "GatlingLaser",
      "PlasmaThrower_DragonsMaw",
      "PlasmaRifle",
      "AssaultRifle_Rusty",
      "AlienBlaster_Destabilizer",
      "Fatman_Guided",
      "Melee_RaiderSword",
      "SniperRifle_Hardened",
      "Melee_BaseballBat",
      "PlasmaRifle_MeanGreenMonster",
      "032Pistol_WildBillsSidearm",
      "GaussRifle",
      "LaserRifle_WaserWifle",
      "InstitutePistol_Scoped",
      "Flamer_Pressurized",
      "AssaultRifle_ArmorPiercing",
      "Railgun_Rusty",
      "Minigun_Hardened",
      "InstituteRifle_VirgilsRifle",
      "JunkJet_Electrified",
      "Flamer_Hardened",
      "GatlingLaser_Focused",
      "Magnum_Hardened",
      "Railgun_Railmaster",
      "Melee_PoolCue",
      "Minigun_Enhanced",
      "GaussRifle_Rusty",
      "JunkJet_RecoilCompensated",
      "Pistol_LoneWanderer",
      "MissilLauncher",
      "LaserPistol",
      "InstitutePistol_Incendiary",
      "BBGun_ArmorPiercing",
      "Rifle_ArmorPiercing",
      "AssaultRifle_Enhanced",
      "LaserRifle_Rusty",
      "CombatShotgun",
      "GatlingLaser_Tuned",
      "SawedOffShotgun_Hardened",
      "PlasmaThrower_Agitated",
      "Magnum_Blackhawk",
      "AssaultRifle_Infiltrator",
      "PlasmaPistol_MPLXNovasurge",
      "HuntingRifle_ArmorPiercing",
      "Railgun_Enhanced",
      "SniperRifle_Enhanced",
      "GaussRifle_Accelerated",
      "PlasmaThrower_Tactical",
      "CombatShotgun_Rusty",
      "PipeRifle_Bayoneted",
      "GaussRifle_Hardened",
      "PlasmaThrower",
      "AlienBlaster_Focused",
      "SawedOffShotgun_Kneecapper",
      "Flamer_Enhanced",
      "Railgun_Hardened",
      "GaussRifle_Magnetro4000",
      "PipePistol_Auto",
      "SniperRifle_ArmorPiercing",
      "PipeRifle_NightVision",
      "MissilLauncher_Enhanced",
      "PipeRifle_Calibrated",
      "LaserMusket",
      "Rifle_Hardened",
      "Fatman_Enhanced",
      "JunkJet",
      "PlasmaRifle_Amplified",
      "Minigun_Rusty",
      "Melee_FireHydrantBat",
      "GatlingLaser_Amplified",
      "JunkJet_Flaming",
      "Shotgun_DoubleBarrelled",
      "LaserPistol_Amplified",
      "AlienBlaster_Amplified",
      "InstituteRifle_NightVision",
      "SniperRifle_VictoryRifle",
      "PlasmaPistol",
      "Minigun_LeadBelcher",
      "Melee_ButcherKnife",
      "AssaultRifle",
      "Shotgun_Hardened",
      "MissilLauncher_Hardened",
      "LaserRifle_Focused",
      "AlienBlaster",
      "Melee_Pickaxe",
      "032Pistol_ArmorPiercing",
      "SniperRifle",
      "Pistol_ArmorPiercing",
      "PlasmaPistol_Tuned",
      "Melee_KitchenKnife",
      "AssaultRifle_Hardened",
      "Fatman_Hardened",
      "Shotgun_FarmersDaughter",
      "CombatShotgun_CharonsShotgun",
      "AlienBlaster_Rusty",
      "GatlingLaser_Vengeance",
      "InstituteRifle_Long",
      "JunkJet_TechniciansRevenge",
      "LaserPistol_SmugglersEnd",
      "Flamer_Burnmaster",
      "SniperRifle_Rusty",
      "InstituteRifle",
      "MissilLauncher_MissLauncher",
      "InstituteRifle_Targeting",
      "Fatman_Rusty",
      "Rifle_LincolnsRepeater",
      "PipeRifle_BigSister",
      "Fatman",
      "GatlingLaser_Rusty",
      "Fatman_Mirv",
      "PlasmaPistol_Focused",
      "Shotgun_Enhanced",
      "PipePistol_Scoped",
      "Minigun",
      "InstitutePistol",
      "ProfessorSpecial",
      "PiperSpecial",
      "AllNightware_Lucky",
      "KnightSpecial",
      "BowlingShirt",
      "HunterGear_Bounty",
      "BattleArmor_Sturdy",
      "ColonelSpecial",
      "UtilityJumpsuit_Sturdy",
      "DooWopOutfit",
      "PowerArmor_51f",
      "PowerArmor_MkVI",
      "PowerArmor_51d",
      "PowerArmor_51a",
      "BishopSpecial",
      "FlightSuit_Advanced",
      "SodaFountainDress",
      "HandymanJumpsuit_Expert",
      "HandymanJumpsuit_Advanced",
      "GreaserSpecial",
      "ThreedogSpecial",
      "WastelandSurgeon_Doctor",
      "PowerArmor_T45f",
      "CromwellSpecial",
      "PowerArmor_T45d",
      "WandererArmor_Sturdy",
      "LifeguardOutfit",
      "WrestlerSpecial",
      "EngineerSpecial",
      "MilitaryJumpsuit_Officer",
      "PrestonSpecial",
      "HazmatSuit_Heavy",
      "CombatArmor_Heavy",
      "RaiderArmor_Sturdy",
      "SlasherSpecial",
      "AlistairSpecial",
      "SurvivorSpecial",
      "AllNightware_Naughty",
      "InstituteJumper_Advanced",
      "SurgeonSpecial",
      "MayorSpecial",
      "RiotGear_Sturdy",
      "ScifiSpecial",
      "MetalArmor_Sturdy",
      "BOSUniform",
      "SynthArmor_Heavy",
      "Vest",
      "BittercupSpecial",
      "SoldierSpecial",
      "UtilityJumpsuit_Heavy",
      "HunterGear_Mutant",
      "AbrahamSpecial",
      "EulogyJonesSpecial",
      "PowerArmor_MkIV",
      "BaseballUniform",
      "PowerArmor_T60a",
      "PowerArmor_T60d",
      "FormalWear_Lucky",
      "PowerArmor_T60f",
      "Swimsuit",
      "LabCoat_Expert",
      "LabCoat_Advanced",
      "EmpressSpecial",
      "LibrarianSpecial",
      "KingSpecial",
      "MilitaryJumpsuit_Commander",
      "ScribeRobe",
      "BOSUniform_Expert",
      "LucasSpecial",
      "PrinceSpecial",
      "WandererArmor_Heavy",
      "RadiationSuit_Expert",
      "ScientistScrubs_Commander",
      "HazmatSuit_Sturdy",
      "MetalArmor_Heavy",
      "ButchSpecial",
      "ComedianSpecial",
      "RaiderArmor_Heavy",
      "FlightSuit_Expert",
      "SportsfanSpecial",
      "RothchildSpecial",
      "LabCoat",
      "BattleArmor",
      "BattleArmor_Heavy",
      "CombatArmor",
      "CombatArmor_Sturdy",
      "WandererArmor",
      "RaiderArmor",
      "WastelandSurgeon",
      "HunterGear_Treasure",
      "RiotGear",
      "RiotGear_Heavy",
      "SequinDress",
      "WastelandSurgeon_Settler",
      "HandymanJumpsuit",
      "MechanicJumpsuit",
      "InstituteJumper_Expert",
      "UtilityJumpsuit",
      "AllNightware",
      "WorkDress",
      "MilitaryJumpsuit",
      "FormalWear",
      "FormalWear_Fancy",
      "CheckeredShirt",
      "SweaterVest",
      "PowerArmor",
      "PowerArmor_MkI",
      "ScribeRobe_Initiate",
      "ScribeRobe_Elder",
      "RadiationSuit_Advanced",
      "RadiationSuit",
      "MoviefanSpecial",
      "NinjaSuit",
      "FlightSuit",
      "HazmatSuit",
      "BOSUniform_Advanced",
      "ScientistScrubs_Officer",
      "ScientistScrubs",
      "PolkaDotDress",
      "032Pistol",
      "032Pistol_Enhanced",
      "032Pistol_Rusty",
      "AlienBlaster_Tuned",
      "BBGun",
      "BBGun_Enhanced",
      "BBGun_Hardened",
      "BBGun_Rusty",
      "CombatShotgun_DoubleBarrelled",
      "CombatShotgun_Enhanced",
      "Flamer",
      "GaussRifle_Enhanced",
      "HuntingRifle",
      "HuntingRifle_Enhanced",
      "HuntingRifle_Hardened",
      "HuntingRifle_Rusty",
      "LaserPistol_Rusty",
      "LaserPistol_Tuned",
      "LaserRifle",
      "LaserRifle_Amplified",
      "Magnum",
      "Magnum_ArmorPiercing",
      "Magnum_Enhanced",
      "Magnum_Rusty",
      "Minigun_ArmorPiercing",
      "MissilLauncher_Guided",
      "MissilLauncher_Rusty",
      "PipePistol",
      "PipePistol_HairTrigger",
      "PipePistol_Heavy",
      "Pistol",
      "Pistol_Enhanced",
      "Pistol_Hardened",
      "Pistol_Rusty",
      "PlasmaPistol_Amplified",
      "PlasmaPistol_Rusty",
      "PlasmaRifle_Rusty",
      "PlasmaRifle_Tuned",
      "Railgun_Accelerated",
      "Rifle",
      "Rifle_Enhanced",
      "Rifle_Rusty",
      "SawedOffShotgun",
      "SawedOffShotgun_DoubleBarrelled",
      "SawedOffShotgun_Enhanced",
      "SawedOffShotgun_Rusty",
      "Shotgun"];
      alert("Unlocked Recipes!");
  }

  function extractCount() {
    if ($scope.save.vault.LunchBoxesByType.toString().indexOf("0") > -1) {
      _lunchboxCount = $scope.save.vault.LunchBoxesByType.toString().match(/0/g).length;
    } else {
      _lunchboxCount = 0;
    }

    if ($scope.save.vault.LunchBoxesByType.toString().indexOf("1") > -1) {
      _handyCount = $scope.save.vault.LunchBoxesByType.toString().match(/1/g).length;
    } else {
      _handyCount = 0;
    }

    if ($scope.save.vault.LunchBoxesByType.toString().indexOf("2") > -1) {
      _petCarrierCount = $scope.save.vault.LunchBoxesByType.toString().match(/2/g).length;
    } else {
      _petCarrierCount = 0;
    }

    if ($scope.save.vault.LunchBoxesByType.toString().indexOf("3") > -1) {
      _starterPackCount = $scope.save.vault.LunchBoxesByType.toString().match(/3/g).length;
    } else {
      _starterPackCount = 0;
    }

    $scope.lunchboxCount = _lunchboxCount;
    $scope.handyCount = _handyCount;
    $scope.petCarrierCount = _petCarrierCount;
    $scope.starterPackCount = _starterPackCount;
  }

  function updateCount() {
    var types = $scope.save.vault.LunchBoxesByType = [],
      count = $scope.save.vault.LunchBoxesCount = _lunchboxCount + _handyCount + _petCarrierCount + _starterPackCount;

    for (var i = 0; i < _lunchboxCount; i++) {
      types.push(0);
    }

    for (var i = 0; i < _handyCount; i++) {
      types.push(1);
    }

    for (var i = 0; i < _petCarrierCount; i++) {
      types.push(2);
    }

    for (var i = 0; i < _starterPackCount; i++) {
      types.push(3);
    }
  }

  function extractTeams() {
    $scope.save.vault.wasteland.teams.forEach(function (team) {
      $scope.wastelandTeams.push({
        teamIndex: team.teamIndex,
        dweller: findDweller(team.dwellers[0]),
        elapsedTimeAliveExploring: team.elapsedTimeAliveExploring,
        returnTripDuration: team.returnTripDuration,
        teamEquipment: team.teamEquipment
      });
      $scope.wastelandTeams2.push({
        teamIndex: team.teamIndex,
        actor: findActor(team.actors[0]),
        elapsedTimeAliveExploring: team.elapsedTimeAliveExploring,
        returnTripDuration: team.returnTripDuration,
        teamEquipment: team.teamEquipment
      });
    });
  }

  function findDweller(id) {
    var dweller = null;
    $scope.save.dwellers.dwellers.forEach(function (d) {
      if (d.serializeId == id) {
        dweller = d;
      }
    });
    return dweller;
  }

  function findActor(id) {
    var actor = null;
    $scope.save.dwellers.actors.forEach(function (d) {
      if (d.serializeId == id) {
        actor = d;
      }
    });
    return actor;
  }

  function updateTeam() {
    $scope.save.vault.wasteland.teams.forEach(function (team) {
      if (team.teamIndex == $scope.team.teamIndex) {
        team.elapsedTimeAliveExploring = $scope.team.elapsedTimeAliveExploring;
        team.returnTripDuration = $scope.team.returnTripDuration;
        team.teamEquipment = $scope.team.teamEquipment;
      }
    });
  }

  $scope.dwellerweaponlist = {
    "032Pistol": '.32 Pistol',
    Pistol: '10mm Pistol',
    GaussRifle_Accelerated: 'Accelerated Gauss Rifle',
    Railgun_Accelerated: 'Accelerated Railway Rifle',
    PlasmaThrower_Agitated: 'Agitated Plasma Thrower',
    AlienBlaster: 'Alien Blaster',
    AmataPistol: "Amata's Pistol",
    AlienBlaster_Amplified: 'Amplified Alien Blaster',
    GatlingLaser_Amplified: 'Amplified Gatling Laser',
    LaserPistol_Amplified: 'Amplified Laser Pistol',
    LaserRifle_Amplified: 'Amplified Laser Rifle',
    PlasmaPistol_Amplified: 'Amplified Plasma Pistol',
    PlasmaRifle_Amplified: 'Amplified Plasma Rifle',
    InstitutePistol_Apotheosis: 'Apotheosis',
    "032Pistol_ArmorPiercing": 'Armor Piercing .32 Pistol',
    Pistol_ArmorPiercing: 'Armor Piercing 10mm Pistol',
    AssaultRifle_ArmorPiercing: 'Armor Piercing Assault Rifle',
    BBGun_ArmorPiercing: 'Armor Piercing BB Gun',
    HuntingRifle_ArmorPiercing: 'Armor Piercing Hunting Rifle',
    Rifle_ArmorPiercing: 'Armor Piercing Lever-Action Rifle',
    Minigun_ArmorPiercing: 'Armor Piercing Minigun',
    Magnum_ArmorPiercing: 'Armor Piercing Scoped .44',
    SniperRifle_ArmorPiercing: 'Armor Piercing Sniper Rifle',
    AssaultRifle: 'Assault Rifle',
    PipePistol_Auto: 'Auto Pipe Pistol',
    Melee_BaseballBat: 'Baseball Bat',
    PipeRifle_Bayoneted: 'Bayoneted Pipe Rifle',
    BBGun: 'BB Gun',
    PipeRifle_BigSister: 'Big Sister',
    Magnum_Blackhawk: 'Blackhawk',
    PlasmaThrower_Boosted: 'Boosted Plasma Thrower',
    Flamer_Burnmaster: 'Burnmaster',
    Melee_ButcherKnife: 'Butcher Knife',
    PipeRifle_Calibrated: 'Calibrated Pipe Rifle',
    CombatShotgun_CharonsShotgun: "Charon's Shotgun",
    CombatShotgun: 'Combat Shotgun',
    AlienBlaster_Destabilizer: 'Destabilizer',
    CombatShotgun_DoubleBarrelled: 'Double-Barrel Combat Shotgun',
    SawedOffShotgun_DoubleBarrelled: 'Double-Barrel Sawed-Off Shotgun',
    Shotgun_DoubleBarrelled: 'Double-Barrel Shotgun',
    PlasmaThrower_DragonsMaw: "Dragon's Maw",
    JunkJet_Electrified: 'Electrified Junk Jet',
    "032Pistol_Enhanced": 'Enhanced .32 Pistol',
    Pistol_Enhanced: 'Enhanced 10mm Pistol',
    AssaultRifle_Enhanced: 'Enhanced Assault Rifle',
    BBGun_Enhanced: 'Enhanced BB Gun',
    CombatShotgun_Enhanced: 'Enhanced Combat Shotgun',
    Fatman_Enhanced: 'Enhanced Fat Man',
    Flamer_Enhanced: 'Enhanced Flamer',
    GaussRifle_Enhanced: 'Enhanced Gauss Rifle',
    HuntingRifle_Enhanced: 'Enhanced Hunting Rifle',
    Rifle_Enhanced: 'Enhanced Lever-Action Rifle',
    Minigun_Enhanced: 'Enhanced Minigun',
    MissilLauncher_Enhanced: 'Enhanced Missile Launcher',
    Railgun_Enhanced: 'Enhanced Railway Rifle',
    SawedOffShotgun_Enhanced: 'Enhanced Sawed-Off Shotgun',
    Magnum_Enhanced: 'Enhanced Scoped .44',
    Shotgun_Enhanced: 'Enhanced Shotgun',
    SniperRifle_Enhanced: 'Enhanced Sniper Rifle',
    InstituteRifle_Excited: 'Excited Institute Rifle',
    Shotgun_FarmersDaughter: "Farmer's Daughter",
    Fatman: 'Fat Man',
    Melee_FireHydrantBat: 'Fire Hydrant Bat',
    Fist: 'Fist',
    Flamer: 'Flamer',
    JunkJet_Flaming: 'Flaming Junk Jet',
    AlienBlaster_Focused: 'Focused Alien Blaster',
    GatlingLaser_Focused: 'Focused Gatling Laser',
    LaserPistol_Focused: 'Focused Laser Pistol',
    LaserRifle_Focused: 'Focused Laser Rifle',
    PlasmaPistol_Focused: 'Focused Plasma Pistol',
    PlasmaRifle_Focused: 'Focused Plasma Rifle',
    GatlingLaser: 'Gatling Laser',
    GaussRifle: 'Gauss Rifle',
    Fatman_Guided: 'Guided Fat Man',
    MissilLauncher_Guided: 'Guided Missile Launcher',
    PipePistol_HairTrigger: 'Hair Trigger Pipe Pistol',
    "032Pistol_Hardened": 'Hardened .32 Pistol',
    Pistol_Hardened: 'Hardened 10mm Pistol',
    AssaultRifle_Hardened: 'Hardened Assault Rifle',
    BBGun_Hardened: 'Hardened BB Gun',
    CombatShotgun_Hardened: 'Hardened Combat Shotgun',
    Fatman_Hardened: 'Hardened Fat Man',
    Flamer_Hardened: 'Hardened Flamer',
    GaussRifle_Hardened: 'Hardened Gauss Rifle',
    HuntingRifle_Hardened: 'Hardened Hunting Rifle',
    Rifle_Hardened: 'Hardened Lever-Action Rifle',
    Minigun_Hardened: 'Hardened Minigun',
    MissilLauncher_Hardened: 'Hardened Missile Launcher',
    Railgun_Hardened: 'Hardened Railway Rifle',
    SawedOffShotgun_Hardened: 'Hardened Sawed-Off Shotgun',
    Magnum_Hardened: 'Hardened Scoped .44',
    Shotgun_Hardened: 'Hardened Shotgun',
    SniperRifle_Hardened: 'Hardened Sniper Rifle',
    PipePistol_Heavy: 'Heavy Pipe Pistol',
    LeverActionRifle_Henrietta: 'Henrietta',
    HuntingRifle: 'Hunting Rifle',
    InstitutePistol_Improved: 'Improved Institute Pistol',
    InstitutePistol_Incendiary: 'Incendiary Institute Pistol',
    AssaultRifle_Infiltrator: 'Infiltrator',
    InstitutePistol: 'Institute Pistol',
    InstituteRifle: 'Institute Rifle',
    JunkJet: 'Junk Jet',
    Melee_KitchenKnife: 'Kitchen Knife',
    SawedOffShotgun_Kneecapper: 'Kneecapper',
    LaserMusket: 'Laser Musket',
    LaserPistol: 'Laser Pistol',
    LaserRifle: 'Laser Rifle',
    Minigun_LeadBelcher: 'Lead Belcher',
    Rifle: 'Lever-Action Rifle',
    Rifle_LincolnsRepeater: "Lincoln's Repeater",
    PipePistol_LittleBrother: 'Little Brother',
    Pistol_LoneWanderer: 'Lone Wanderer',
    InstituteRifle_Long: 'Long Institute Rifle',
    PipeRifle_Long: 'Long Pipe Rifle',
    GaussRifle_Magnetro4000: 'Magnetron 4000',
    PlasmaRifle_MeanGreenMonster: 'Mean Green Monster',
    Minigun: 'Minigun',
    Fatman_Mirv: 'MIRV',
    MissilLauncher_MissLauncher: 'Miss Launcher',
    MissilLauncher: 'Missile Launcher',
    PlasmaPistol_MPLXNovasurge: 'MPXL Novasurge',
    InstituteRifle_NightVision: 'Night-Vision Institute Rifle',
    PipeRifle_NightVision: 'Night-Vision Pipe Rifle',
    HuntingRifle_OlPainless: "Ol' Painless",
    PlasmaThrower_Overcharged: 'Overcharged Plasma Thrower',
    Melee_Pickaxe: 'Pickaxe',
    PipePistol: 'Pipe Pistol',
    PipeRifle: 'Pipe Rifle',
    PlasmaPistol: 'Plasma Pistol',
    PlasmaRifle: 'Plasma Rifle',
    PlasmaThrower: 'Plasma Thrower',
    PoliceBaton: 'PoliceBaton',
    Melee_PoolCue: 'Pool Cue',
    Flamer_Pressurized: 'Pressurized Flamer',
    Railgun_Railmaster: 'Railmaster',
    Railgun: 'Railway Rifle',
    JunkJet_RecoilCompensated: 'Recoil Compensated Junk Jet',
    BBGun_RedRocket: 'Red Rocket',
    Melee_RaiderSword: 'Relentless Raider Sword',
    "032Pistol_Rusty": 'Rusty .32 Pistol',
    Pistol_Rusty: 'Rusty 10mm Pistol',
    AlienBlaster_Rusty: 'Rusty Alien Blaster',
    AssaultRifle_Rusty: 'Rusty Assault Rifle',
    BBGun_Rusty: 'Rusty BB Gun',
    CombatShotgun_Rusty: 'Rusty Combat Shotgun',
    Fatman_Rusty: 'Rusty Fat Man',
    Flamer_Rusty: 'Rusty Flamer',
    GatlingLaser_Rusty: 'Rusty Gatling Laser',
    GaussRifle_Rusty: 'Rusty Gauss Rifle',
    HuntingRifle_Rusty: 'Rusty Hunting Rifle',
    LaserPistol_Rusty: 'Rusty Laser Pistol',
    LaserRifle_Rusty: 'Rusty Laser Rifle',
    Rifle_Rusty: 'Rusty Lever-Action Rifle',
    Minigun_Rusty: 'Rusty Minigun',
    MissilLauncher_Rusty: 'Rusty Missile Launcher',
    PlasmaPistol_Rusty: 'Rusty Plasma Pistol',
    PlasmaRifle_Rusty: 'Rusty Plasma Rifle',
    Railgun_Rusty: 'Rusty Railway Rifle',
    SawedOffShotgun_Rusty: 'Rusty Sawed-Off Shotgun',
    Magnum_Rusty: 'Rusty Scoped .44',
    Shotgun_Rusty: 'Rusty Shotgun',
    SniperRifle_Rusty: 'Rusty Sniper Rifle',
    SawedOffShotgun: 'Sawed-Off Shotgun',
    InstitutePistol_Scattered: 'Scattered Institute Pistol',
    Magnum: 'Scoped .44',
    InstitutePistol_Scoped: 'Scoped Institute Pistol',
    PipePistol_Scoped: 'Scoped Pipe Pistol',
    Shotgun: 'Shotgun',
    LaserPistol_SmugglersEnd: "Smuggler's End",
    BumperSword: 'Sniper Rifle',
    SniperRifle: 'Sniper Rifle',
    JunkJet_Tactical: 'Tactical Junk Jet',
    PlasmaThrower_Tactical: 'Tactical Plasma Thrower',
    InstituteRifle_Targeting: 'Targeting Institute Rifle',
    JunkJet_TechniciansRevenge: "Technician's Revenge",
    AlienBlaster_Tuned: 'Tuned Alien Blaster',
    GatlingLaser_Tuned: 'Tuned Gatling Laser',
    LaserPistol_Tuned: 'Tuned Laser Pistol',
    LaserRifle_Tuned: 'Tuned Laser Rifle',
    PlasmaPistol_Tuned: 'Tuned Plasma Pistol',
    PlasmaRifle_Tuned: 'Tuned Plasma Rifle',
    GatlingLaser_Vengeance: 'Vengeance',
    SniperRifle_VictoryRifle: 'Victory Rifle',
    InstituteRifle_VirgilsRifle: "Virgil's Rifle",
    LaserRifle_WaserWifle: 'Wazer Wifle',
    "032Pistol_WildBillsSidearm": "Wild Bill's Sidearm"
  };

  $scope.dwelleroutfitslist = {
    AbrahamSpecial: "Abraham's Relaxedwear",
    AlistairSpecial: "Tenpenny's Suit",
    AllNightware: 'Nightwear',
    AllNightware_Lucky: 'Lucky Nightwear',
    AllNightware_Naughty: 'Naughty Nightwear',
    AmataSpecial: "Amata's Jumpsuit",
    ArgyleSweater: 'Accountant Outfit',
    BaseballUniform: 'Baseball Uniform',
    BattleArmor: 'Battle Armor',
    BattleArmor_Heavy: 'Heavy Battle Armor',
    BattleArmor_Sturdy: 'Sturdy Battle Armor',
    BishopSpecial: 'Clergy Outfit',
    BittercupSpecial: "Bittercup's Outfit",
    BOSUniform: 'BoS Uniform',
    BOSUniform_Advanced: 'Advanced BoS Uniform',
    BOSUniform_Expert: 'Expert BoS Uniform',
    BowlingShirt: 'Drag Racer',
    BusinessDress: 'Agent Provocateur',
    BusinessSuit: 'Business Suit',
    ButchSpecial: "Tunnel Snakes' Outfit",
    CheckeredShirt: 'Spring Casualwear',
    ColonelSpecial: "Autumn's Uniform",
    CombatArmor: 'Combat Armor',
    CombatArmor_Heavy: 'Heavy Combat Armor',
    CombatArmor_Sturdy: 'Sturdy Combat Armor',
    ComedianSpecial: 'Comedian Outfit',
    costume_01: 'Casual01',
    costume_02: 'Casual02',
    costume_03: 'Casual03',
    costume_04: 'Casual04',
    costume_05: 'Casual05',
    costume_06: 'Casual06',
    costume_07: 'Casual07',
    costume_08: 'Casual08',
    costume_09: 'Casual09',
    costume_10: 'Casual10',
    CromwellSpecial: "Confessor Cromwell's Rags",
    Detective: 'Detective Outfit',
    DooWopOutfit: 'Doo-Wop Singer',
    DrLiSpecial: "Doctor Li's Outfit",
    ElderLyonsSpecial: "Elder Lyon's Robe",
    EmpressSpecial: 'Republic Robes',
    EngineerSpecial: 'Engineer Outfit',
    EulogyJonesSpecial: "Eulogy Jones' Suit",
    FarHarborSpecial: 'Tattered Longcoat',
    FlightSuit: 'Flight Suit',
    FlightSuit_Advanced: 'Advanced Flight Suit',
    FlightSuit_Expert: 'Expert Flight Suit',
    FormalWear: 'Formal Wear',
    FormalWear_Fancy: 'Fancy Formal Wear',
    FormalWear_Lucky: 'Lucky Formal Wear',
    GreaserSpecial: 'Greaser Outfit',
    HandymanJumpsuit: 'Handyman Jumpsuit',
    HandymanJumpsuit_Advanced: 'Advanced Jumpsuit',
    HandymanJumpsuit_Expert: 'Expert Jumpsuit',
    HarknessSpecial: "Harkness' Security Uniform",
    HazmatSuit: 'Wasteland Gear',
    HazmatSuit_Heavy: 'Heavy Wasteland Gear',
    HazmatSuit_Sturdy: 'Sturdy Wasteland Gear',
    Horseman_DeathJacket: "Death's Jacket",
    Horseman_FamineVestment: "Famine's Vestment",
    Horseman_PestilencePlating: "Pestilence's Plating",
    Horseman_WarArmor: "War's Armor",
    HunterGear_Bounty: 'Bounty Hunter Gear',
    HunterGear_Mutant: 'Mutant Hunter Gear',
    HunterGear_Treasure: 'Treasure Hunter Gear',
    InstituteJumper_Advanced: 'Advanced Institute Jumper',
    InstituteJumper_Expert: 'Expert Institute Jumper',
    JacketTshirt: 'Motorcycle Jacket',
    JamesSpecial: "Dad's Lab Uniform",
    JerichoSpecial: "Jericho's Leather Armor",
    JobinsonsJersey: "Rackie Jobinson's Jersey",
    jumpsuit: 'Vault Suit',
    KingSpecial: 'Medieval Ruler Outfit',
    KnightSpecial: 'Knight Armor',
    LabCoat: 'Lab Coat',
    LabCoat_Advanced: 'Advanced Lab Coat',
    LabCoat_Expert: 'Expert Lab Coat',
    LibrarianSpecial: 'Librarian Outfit',
    LifeguardOutfit: 'Lifeguard Outfit',
    LoungeShirt: 'Bowling Shirt',
    LucasSpecial: "Sheriff's Duster",
    MayorSpecial: 'Mayor Outfit',
    MechanicJumpsuit: 'Mechanic Jumpsuit',
    MetalArmor_Heavy: 'Heavy Metal Armor',
    MetalArmor_Sturdy: 'Sturdy Metal Armor',
    MetalArmorRaiderBoss: 'MetalArmorRaiderBoss',
    MilitaryJumpsuit: 'Military Fatigues',
    MilitaryJumpsuit_Commander: 'Commander Fatigues',
    MilitaryJumpsuit_Officer: 'Officer Fatigues',
    MoiraSpecial: "Moira's RobCo Jumpsuit",
    MoviefanSpecial: 'Movie Fan Outfit',
    MrBurkeSpecial: 'Mr',
    NinjaSuit: 'Ninja Outfit',
    NormalClothing: 'NormalClothing',
    PiperSpecial: "Piper's Outfit",
    PolkaDotDress: 'Polka Dot Sundress',
    PowerArmor: 'T-45a Power Armor',
    PowerArmor_51a: 'T-51a Power Armor',
    PowerArmor_51d: 'T-51d Power Armor',
    PowerArmor_51f: 'T-51f Power Armor',
    PowerArmor_MkI: 'X-01 Mk I Power Armor',
    PowerArmor_MkIV: 'X-01 Mk IV Power Armor',
    PowerArmor_MkVI: 'X-01 Mk VI Power Armor',
    PowerArmor_T45d: 'T-45d Power Armor',
    PowerArmor_T45f: 'T-45f Power Armor',
    PowerArmor_T60a: 'T-60a Power Armor',
    PowerArmor_T60d: 'T-60d Power Armor',
    PowerArmor_T60f: 'T-60f Power Armor',
    PrestonSpecial: 'Minuteman Uniform',
    PrinceSpecial: 'Nobility Outfit',
    ProfessorSpecial: 'Professor Outfit',
    RadiationSuit: 'Radiation Suit',
    RadiationSuit_Advanced: 'Advanced Radiation Suit',
    RadiationSuit_Expert: 'Expert Radiation Suit',
    RaiderArmor: 'Raider Armor',
    RaiderArmor_Heavy: 'Heavy Raider Armor',
    RaiderArmor_Sturdy: 'Sturdy Raider Armor',
    RiotGear: 'Merc Gear',
    RiotGear_Heavy: 'Heavy Merc Gear',
    RiotGear_Sturdy: 'Sturdy Merc Gear',
    RothchildSpecial: "Scribe Rothchild's Robe",
    SantaSuit_Original: 'Original Santa Suit',
    SarahSpecial: "Lyon's Pride Armor",
    ScientistScrubs: 'Junior Officer Uniform',
    ScientistScrubs_Commander: 'Commander Uniform',
    ScientistScrubs_Officer: 'Officer Uniform',
    ScifiSpecial: 'Sci-Fi Fan Outfit',
    ScribeRobe: 'Scribe Robe',
    ScribeRobe_Elder: 'Elder Robe',
    ScribeRobe_Initiate: 'Initiate Robe',
    SequinDress: 'Vault Socialite',
    SlasherSpecial: 'Horror Fan Outfit',
    SodaFountainDress: 'Soda Fountain Dress',
    SoldierSpecial: 'Soldier Uniform',
    SpecialThemeHalloween: 'Ghost Costume',
    SpecialThemeHalloween2: 'Skeleton Costume',
    SpecialThemeThanksGiving: 'Pilgrim Outfit',
    SpecialThemeXmas: 'Santa Suit',
    SpecialThemeXmas2: 'Elf Outfit',
    SportsfanSpecial: 'Sports Fan Outfit',
    StarPaladinSpecial: "Cross' Power Armor",
    SurgeonSpecial: 'Surgeon Outfit',
    SurvivorSpecial: 'Survivor Armor',
    Suspenders: 'Bespoke Attire',
    SweaterVest: 'Pre-War Suburbanite',
    Swimsuit: 'Swimsuit',
    SwingDress: 'Swing Dress',
    SynthArmor_Heavy: 'Heavy Synth Armor',
    ThreedogSpecial: "Three Dog's Outfit",
    TiedBlouse: 'Country Girl',
    UtilityJumpsuit: 'Armored Vault Suit',
    UtilityJumpsuit_Heavy: 'Heavy Vault Suit',
    UtilityJumpsuit_Sturdy: 'Sturdy Vault Suit',
    Vest: 'Post-War Casanova',
    WaitressUniform: 'Waitress Uniform',
    WandererArmor: 'Leather Armor',
    WandererArmor_Heavy: 'Heavy Leather Armor',
    WandererArmor_Sturdy: 'Sturdy Leather Armor',
    WastelandSurgeon: 'Wasteland Surgeon',
    WastelandSurgeon_Doctor: 'Wasteland Doctor',
    WastelandSurgeon_Settler: 'Wasteland Medic',
    WorkDress: 'Rural Schoolmarm',
    WrestlerSpecial: 'Wrestler Outfit'
  };
});

function preset(preset, saveFileName) {

  /*
  if(isLoaded){
    if(window.location.href.indexOf("?") > -1){
      window.location.href = window.location.href.substring(0,window.location.href.indexOf("?")) +  "?preset=" + preset + "?savename=" + saveFileName;
    }else{
      window.location.href = window.location.href +  "?preset=" + preset + "?savename=" + saveFileName;

    }
    throw new Error("There already is a savefile loaded.")

  }  */ // Why does this matter?

  file = "presets/" + preset + ".json";

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = readPreset;
  xhr.open("GET", file, true);
  xhr.send();

  function readPreset() {
    if (xhr.readyState == 4) {
      var resp = JSON.parse(xhr.responseText);
      $('.instructions').hide();

      edit(saveFileName, resp);
    }
  };
}
