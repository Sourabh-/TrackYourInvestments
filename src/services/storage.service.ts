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
        //CREATE TABLE IF DOES NOT EXIST
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
          })
          .catch(e => {
            console.log(e);
          });

      })
      .catch((e) => {
        console.log(e);
      })
    });
  }

  async getInvestments(force?) {
    if(this.dbObj) {
      let query = "SELECT * from investments";
      return await this.dbObj.executeSql(query, {});
    } else {
      throw new Error('DB NOT READY');
    }

    //return this.allInvestments.length && !force ? this.allInvestments : localStorage.investments ? JSON.parse(localStorage.investments) : [];
  }

  async getInvestment(name) {
  	if(this.dbObj) {
  	 	let query = "SELECT * from investments" + (`WHERE name='${name}'`);
  	 	return await this.dbObj.executeSql(query, {});
  	} else {
  		throw new Error('DB NOT READY');
  	}

    /*if(localStorage.investments) {
      let stor = JSON.parse(localStorage.investments);
      for(let i=0; i<stor.length; i++) {
        if(stor[i].name == name) {
          return [stor[i]];
        }
      }
    }
    
    return [];*/
  }

  async setInvestment(investment) {
  	if(this.dbObj) {
  	 	let query = `INSERT INTO investments (name, type, totalAmount, startDate, profit, loss) 
                   VALUES (
                     '${investment.name}', 
                     '${investment.type}', 
                     '${investment.totalAmount}', 
                     '${investment.startDate}', 
                     '${investment.profit}', 
                     '${investment.loss}'
                   )`;
  	 	return await this.dbObj.executeSql(query, {});
  	} else {
  		throw new Error('DB NOT READY');
  	}

    /*let investments = localStorage.investments ? JSON.parse(localStorage.investments) : [];
    for(let i=0; i<investments.length; i++) {
      if(investment.name == investments[i].name) {
        throw new Error('EXISTS');
      }
    }
    investments.push(investment);

    localStorage.investments = JSON.stringify(investments);
    return 'SUCCESS';*/
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

    /*let investments = JSON.parse(localStorage.investments);
    for(let i=0; i<investments.length; i++) {
      if(investments[i].name == name) {
        for(let key in investment) {
          investments[i][key] = investment[key];
        }
        break;
      }
    }

    localStorage.investments = JSON.stringify(investments);
    return "";*/
  }

  async delInvestment(name) {
    if(this.dbObj) {
      let query = `DELETE from investments WHERE name='${name}'`;
      return await this.dbObj.executeSql(query, {});
    } else {
      throw new Error('DB NOT READY');
    }


    /*let investments = JSON.parse(localStorage.investments);
    for(let i=0; i<investments.length; i++) {
      if(investments[i].name == name) {
        investments.splice(i, 1);
        break;
      }
    }

    localStorage.investments = JSON.stringify(investments);
    return "";*/
  }
}
