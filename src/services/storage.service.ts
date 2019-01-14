import { Injectable } from "@angular/core";
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Platform } from 'ionic-angular';

@Injectable()
export class SQLStorageService {

  public dbObj: SQLiteObject;
  public allInvestments = [];

  constructor(private sqlite: SQLite, platform: Platform) {
    platform.ready().then(() => {
      this.sqlite.create({
        name: 'data.db',
        location: 'default'
      })
      .then((db: SQLiteObject) => {
        this.dbObj = db;
        //CREATE INVESTMENTS TABLE IF DOES NOT EXIST
        db.executeSql(`CREATE TABLE investments 
        ( 
          name varchar(30) NOT NULL PRIMARY KEY,
          type varchar(50),
          totalAmount number(30),
          startDate number(20),
          profit number(20),
          loss number(20)
        )`, {})
            .then(() => {
              console.log("Connection established.");
              this.addColumn(db, 'maturityDate', 'number(20)');
              this.addColumn(db, 'notes', 'varchar(1000)');
              this.addColumn(db, 'remindMe', 'varchar(5)');
            })
            .catch(e => {
              console.log(e);
              this.addColumn(db, 'maturityDate', 'number(20)');
              this.addColumn(db, 'notes', 'varchar(1000)');
              this.addColumn(db, 'remindMe', 'varchar(5)');
            });

        //CREATE HISTORY TABLE IF DOES NOT EXIST
        db.executeSql(`CREATE TABLE history 
        (
          name varchar(30) NOT NULL PRIMARY KEY,
          lastModifiedOn number(20),
          history varchar(50000)
        )`, {})
        .then(() => {
          console.log("History table created.");
        })
        .catch((e) => {
          console.log(e);
        })

        //CREATE ADDITION TABLE IF DOES NOT EXIST
        db.executeSql(`CREATE TABLE addition
        (
          name varchar(30) NOT NULL PRIMARY KEY,
          amount number(30),
          period number(20),
          tillDate number(20),
          createdDate number(20),
          modifiedDate number(20)
        )`, {})
        .then(() => {
          console.log("Addition table created.");
        })
        .catch((e) => {
          console.log(e);
        })

        //CREATE PROFIT-ADDITION TABLE IF DOES NOT EXIST
        db.executeSql(`CREATE TABLE profitAddition
        (
          name varchar(30) NOT NULL PRIMARY KEY,
          profit number(20),
          period number(20),
          tillDate number(20),
          createdDate number(20),
          modifiedDate number(20)
        )`, {})
        .then(() => {
          console.log("Profit-Addition table created.");
        })
        .catch((e) => {
          console.log(e);
        })
      })
      .catch((e) => {
        console.log(e);
      })
    });
  }

  addColumn(db, name, type) {
    db.executeSql(`ALTER TABLE investments
      ADD ${name} ${type}`, {})
    .then(() => {
      console.log("New Column added");
    })
    .catch((e) => {
      console.log(e);
    })
  }

  async getInvestments(force?) {
    if(this.dbObj) {
      let query = "SELECT * from investments";
      return await this.dbObj.executeSql(query, {});
    } else {
      throw new Error('DB NOT READY');
    }
  }

  async getInvestment(name) {
  	if(this.dbObj) {
  	 	let query = "SELECT * from investments " + (`WHERE name='${name}'`);
  	 	return await this.dbObj.executeSql(query, {});
  	} else {
  		throw new Error('DB NOT READY');
  	}
  }

  async setInvestment(investment) {
  	if(this.dbObj) {
  	 	let query = `INSERT INTO investments (name, type, totalAmount, startDate, profit, loss, maturityDate, notes, remindMe) 
                   VALUES (
                     '${investment.name}', 
                     '${investment.type}', 
                     '${investment.totalAmount}', 
                     '${investment.startDate}', 
                     '${investment.profit}', 
                     '${investment.loss}',
                     '${investment.maturityDate}',
                     '${investment.notes}',
                     '${investment.remindMe}'
                   )`;
  	 	return await this.dbObj.executeSql(query, {});
  	} else {
  		throw new Error('DB NOT READY');
  	}
  }

  async updateInvestment(name, investment) {
    if(this.dbObj) {
       let _update = '';
       let c = Object.keys(investment).length;
       for(let key in investment) {
         c--;
         _update += `${key} = '${investment[key] + (c == 0 ? "'" : "', ")}`;
       }

       let query = `UPDATE investments SET ${_update} WHERE name='${name}'`;
       return await this.dbObj.executeSql(query, {});
    } else {
      throw new Error('DB NOT READY');
    }
  }

  async delInvestment(name) {
    if(this.dbObj) {
      let query = `DELETE from investments WHERE name='${name}'`;
      return await this.dbObj.executeSql(query, {});
    } else {
      throw new Error('DB NOT READY');
    }
  }

  async getHistory(name) {
    if(this.dbObj) {
       let query = "SELECT * from history " + (`WHERE name='${name}'`);
       return await this.dbObj.executeSql(query, {});
    } else {
      throw new Error('DB NOT READY');
    }
  }

  async delHistory(name) {
    if(this.dbObj) {
      let query = `DELETE from history WHERE name='${name}'`;
      return await this.dbObj.executeSql(query, {});
    } else {
      throw new Error('DB NOT READY');
    }
  }

  addHistory(history) {
    let query = `INSERT OR IGNORE INTO history (name, lastModifiedOn, history) VALUES ('${history.name}', '${history.lastModifiedOn}', '${history.history}')`;
    return this.dbObj.executeSql(query, {})
    .then((res) => {
      return 'SUCCESS';
    })
    .catch((err) => {
      throw new Error(err);
    })
  }

  async updateHistory(history) {
    if(this.dbObj) {
       let query = `UPDATE history SET lastModifiedOn = '${history.lastModifiedOn}', history = '${history.history}' WHERE name='${history.name}'`;

       return this.dbObj.executeSql(query, {})
       .then((res) => {
         if(!res.rowsAffected)
           return this.addHistory(history);
         else return "SUCCESS";
       })
       .catch((err) => { 
         if(err.code == 5) {
           return this.addHistory(history);
         } else {
           throw new Error('Error');
         }
       })
    } else {
      throw new Error('DB NOT READY');
    }
  }

  getAddOrProfitAdd(dbName, name?) {
    if(this.dbObj) {
       let query = `SELECT * from ${dbName} ` + (name ? `WHERE name='${name}'` : "");
       return this.dbObj.executeSql(query, {});
    } else {
      throw new Error('DB NOT READY');
    }
  }

  setAddOrProfitAdd(obj, dbName) {
    if(this.dbObj) {
       obj['createdDate'] = new Date().getTime();
       obj['modifiedDate'] = new Date().getTime();
       
       let ids = Object.keys(obj).join(",");
       let values = "";
       for(let key in obj) {
         values += "'" + obj[key] + "',";
       }

       values = values.substr(0, values.length-1);
       let query = `INSERT INTO ${dbName} (${ids}) 
                   VALUES (
                     ${values}  
                   )`;
       return this.dbObj.executeSql(query, {});
    } else {
      throw new Error('DB NOT READY');
    }
  }

  updateAddOrProfitAdd(obj, dbName, name) {
    if(this.dbObj) {
       obj['modifiedDate'] = new Date().getTime();

       let _update = '';
       let c = Object.keys(obj).length;
       for(let key in obj) {
         c--;
         _update += `${key} = '${obj[key] + (c == 0 ? "'" : "', ")}`;
       }

       let query = `UPDATE ${dbName} SET ${_update} WHERE name='${name}'`;
       return this.dbObj.executeSql(query, {});
    } else {
      throw new Error('DB NOT READY');
    }
  }

  delAddOrProfitAdd(dbName, name) {
    if(this.dbObj) {
      let query = `DELETE from ${dbName} WHERE name='${name}'`;
      return this.dbObj.executeSql(query, {});
    } else {
      throw new Error('DB NOT READY');
    }
  }

  addNewLink(link) {
    let links = [];
    try {
      links = localStorage.getItem('links') ? JSON.parse(localStorage.getItem('links')) : [];
    } catch(e) {
      links = [];
    }

    links.push(link);
    localStorage.setItem('links', JSON.stringify(links));
  }

  deleteLink(id) {
    let links = JSON.parse(localStorage.links);
    for(let i=0; i<links.length; i++) {
      if(links[i].id == id) {
        links.splice(i, 1);
        break;
      }
    }

    localStorage.setItem('links', JSON.stringify(links));
  }

  getLinks() {
    let links = [];
    try {
      links = localStorage.getItem('links') ? JSON.parse(localStorage.getItem('links')) : [];
    } catch(e) {
      links = [];
    }

    return links;
  }

  async mergeAddAndProfitAdd() {
    try {
      let adds = await this.getAddOrProfitAdd('addition');
      let profitAdds = await this.getAddOrProfitAdd('profitAddition');

      for(let i=0; i < this.allInvestments.length; i++) {
        for(let j=0; j < adds.rows.length; j++) {
          if(adds.rows.item(j).name == this.allInvestments[i].name) {
            this.allInvestments[i].addition = adds.rows.item(j);
            break;
          }
        }
        for(let j=0; j < profitAdds.rows.length; j++) {
          if(profitAdds.rows.item(j).name == this.allInvestments[i].name) {
            this.allInvestments[i].profitAddition = profitAdds.rows.item(j);
            break;
          }
        }
      }
      return "SUCCESS";
    } catch(err) {
      console.log(err);
      return new Error(err);
    }
  }
}
