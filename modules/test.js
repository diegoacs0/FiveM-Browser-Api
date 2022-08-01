const mysql = require("mysql2");
const pool = mysql
  .createPool({ host: "localhost", user: "root", database: "zirix" })
  .promise();

var config = {
  monName: "dinheiro",
  dirtName: "dinheiro-sujo",
  vip_cars: ["panto"]
};

async function getUsers() {
  const [identities] = await pool.query("SELECT * FROM vrp_user_identities");
  const [moneys] = await pool.query("SELECT * FROM vrp_user_moneys");
  const [vehicles] = await pool.query("SELECT * FROM vrp_user_vehicles");
  const [datatables] = await pool.query('SELECT * FROM vrp_user_data WHERE dkey = "vRP:datatable"');

  const users = datatables.map(u => {
    const user_id = u.user_id;
    const identity = identities.filter(u => u.user_id == user_id)[0];
    u = JSON.parse(u.dvalue);

    //throwing errors for non-zirix/old-vrp frameworks
    if (typeof identity.firstname == "undefined") identity.firstname = "";
    if (typeof u.thirst == "undefined") u.thirst = 0;
    if (typeof u.hunger == "undefined") u.hunger = 0;

    // declaring and minifying alternative info
    u.user_id = user_id;
    u.registration = identity.registration;
    u.phone = identity.phone;
    u.name = `${identity.name} ${identity.firstname}`;
    u.bank = moneys.filter(u => u.user_id == user_id)[0].bank;
    u.vehicles = vehicles.filter(u => u.user_id == user_id).map(v => v.vehicle);
    u.thirst = Math.floor(u.thirst);
    u.hunger = Math.floor(u.hunger);
    u.groups = Object.keys(u.groups);
    Object.keys(u.inventory).forEach(
      v => (u.inventory[v] = u.inventory[v].amount)
    );
    Object.keys(u.weapons).forEach(v => (u.weapons[v] = u.weapons[v].ammo));

    // delete unuseful things
    delete u.position;
    delete u.customization;
    delete u.gaptitudes;

    return u;
  });
  return users;
}

async function getServerMoney() {
  const users = await getUsers();
  const moneys = {
    bank: 0,
    wallet: 0,
    unwash: 0
  };

  await users.forEach(u => {
    if (typeof u.bank == "undefined") u.bank = 0;
    if (typeof u.inventory[config.monName] == "undefined")
      u.inventory[config.monName] = 0;
    if (typeof u.inventory[config.dirtName] == "undefined")
      u.inventory[config.dirtName] = 0;
    moneys.bank = u.bank + moneys.bank;
    moneys.wallet = moneys.wallet + u.inventory[config.monName];
    moneys.unwash = moneys.unwash + u.inventory[config.dirtName];
  });

  return moneys;
}

async function getServerCars() {
  const users = await getUsers();
  const cars = {
    total: 0,
    vip: 0
  };

  await users.forEach(u => {
    const vipVehs = u.vehicles.filter(v => config.vip_cars.includes(v));
    cars.total = cars.total + u.vehicles.length;
    cars.vip = cars.vip + vipVehs.length;
  });

  return cars;
}

async function getServerOrgs() {
  const users = await getUsers();
  const orgs = {
    members: {},
    money: {}
  };

  await users.forEach(u => {
    u.money = getMoney(u);

    u.groups.forEach(g => {
      if (typeof orgs.members[g] == "undefined") orgs.members[g] = 0;
      if (typeof orgs.money[g] == "undefined")
        orgs.money[g] = {
          bank: 0,
          wallet: 0,
          unwash: 0,
          total: 0
        };

      orgs.money[g].bank = orgs.money[g].bank + u.money.bank;
      orgs.money[g].wallet = orgs.money[g].wallet + u.money.wallet;
      orgs.money[g].unwash = orgs.money[g].unwash + u.money.unwash;
      orgs.money[g].total = orgs.money[g].total + u.money.total;

      orgs.members[g] = orgs.members[g] + 1;
    });
  });

  return orgs;
}

async function getUser(id) {
  const users = await getUsers();
  const user = users.filter(u => u.user_id === id);
  return user[0];
}

function getMoney(u) {
  const moneys = {};

  if (typeof u.bank == "undefined") u.bank = 0;
  if (typeof u.inventory[config.monName] == "undefined")
    u.inventory[config.monName] = 0;
  if (typeof u.inventory[config.dirtName] == "undefined")
    u.inventory[config.dirtName] = 0;

  moneys.bank = u.bank;
  moneys.wallet = u.inventory[config.monName];
  moneys.unwash = u.inventory[config.dirtName];
  moneys.total = moneys.wallet + moneys.unwash + moneys.bank;

  return moneys;
}

async function getServerChests() {
  const [chests] = await pool.query(
    "SELECT * FROM `vrp_srv_data` WHERE `dkey` LIKE 'chest:%'"
  );
  const [houses] = await pool.query(
    "SELECT * FROM `vrp_homes_permissions`"
  );
  
  const chestList = await chests.map(c => {
    // minifying dvalue/items
    c.dvalue = JSON.parse(c.dvalue);
    Object.keys(c.dvalue).forEach(o => {
      c.items[o] = c.dvalue[o].amount;
    });
    delete c.dvalue;
    
    // Identifying/Adjusting car/houses chests
    
    c.dkey = c.dkey.replace("chest:", "");
    
    if (c.dkey.startsWith('u')) {
      const [owner_id, vehicle] = c.dkey.split("u")[1].split("veh_");
      c.type = "vehicle";
      c.user_id = owner_id;
      c.name = vehicle;
    } else {
      const u_house = houses.filter(h=> h.home === c.dkey && h.owner == 1);
      if (u_house.length > 0) {
        c.type = "house";
        c.user_id = u_house[0].user_id;
        c.name = u_house[0].home;
      } else {
        c.type = "org";
        c.user_id = 0; // 0 = server
        c.name = c.dkey;
      }
    }
    delete c.dkey;
    
    return c
    });
  
  return chestList
}

async function findChests(user_id, type, name) {
  const chests = await getServerChests();
  
  // filtering it by identifiers
  const m_chests = await chests.filter(c=> {
    var filter = true;
    if (typeof user_id !== 'undefined') filter = filter && c.user_id == user_id;
    if (typeof type !== 'undefined') filter = filter && c.type == type;
    if (typeof name !== 'undefined') filter = filter && c.name == name;
    
    return filter    
  });
  
  return m_chests
}

async function getServerHouses() {
  const [houses] = await pool.query(
    "SELECT * FROM `vrp_homes_permissions`"
  );
  
  const m_houses = await houses.map(h=>{
    // We don't need duplicates here;
    if (h.owner!=1) return;
    
    // Geting chests and throwing errors;
    h.chest = findChests(h.user_id, 'house', h.home)[0];
    if (typeof h.chest == 'undefined') h.chest = {};
    
    // Deleting unuseful keys & Adjusting some vars
    h.name = h.home;
    delete h.home;
    
    delete h.owner;
    delete h.garage;
    delete h.tax;
  });
  
  return m_houses
}

async function findHouses(user_id, name) {
  const houses = await getServerHouses();
  
  const m_houses = houses.filter(h=>{
    var filter = true;
    if (typeof user_id !== 'undefined') filter = filter && h.user_id == user_id;
    if (typeof name !== 'undefined') filter = filter && h.name == name;
    
    return filter
  });
  
  return m_houses
}
