const Shopify = require("shopify-api-node");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("<creadentionals>");
const axios = require("axios");

async function main() {
  //===================SPREADSHEET======================
  async function spreadsheet() {
    try {
      await doc.useServiceAccountAuth(creds);
      await doc.useServiceAccountAuth({
        client_email:
          "<email>",
        private_key: "<private key>"
          });
      await doc.loadInfo(); // loads document properties and worksheets
      //=========================================
      const sheet = doc.sheetsByIndex[0];
      const rows = await sheet.getRows();
      let my_rows = [];
      let result = []
      rows.forEach((x) => {
        my_rows.push(x.SKU);
      });
     
      const files = await axios.get('<data>')
      my_rows.forEach(sku =>{
         files.data.filter(x=> {
             x.variants.filter(y =>{
                if(y.sku === sku){
                    result.push(x.id)
                    return y.sku;
                }
             })
         })
      })
      return [...new Set(result)]
    } catch (err) {
      console.log(err);
    }
  }
  //==============================================
  let new_skus = await spreadsheet();


  let res = await shop.customCollection.list({
    handle: "<collection>",
  }).catch(err=>console.log(err));
  let id = res[0].id;
  let collect_id = res[0].id;
  let inc = 0;
  async function old_collection() {
    try {
        let all_products = []
      let params = { limit: 10 };

      do {
        let products = await shop.collection.products(collect_id, params);
        products.forEach(x => {
            all_products.push(x.id)
        })
        params = products.nextPageParameters;
      } while (params !== undefined);
      return all_products;
    } catch (err) {
      console.log(err);
    }
  }
let old_collect_pr = await old_collection();
let update_skus = [...new_skus]
console.log(old_collect_pr, update_skus)
async function delete_products(){
    try {
        old_collect_pr.forEach(async pr =>{
            let check = new_skus.filter( sku => sku === pr)
            if(check.length === 0){
                console.log("YES")
                let collections = await shop.collect.list({ product_id: pr });
                    let collect = collections.find((x) => x.collection_id == id).id;
                    console.log("collect", collect)
                    if(collect){
                     let final = await shop.collect.delete(collect);
                     console.log("Delete", final)
                    }
            }
            else{
                let index = 0;
                update_skus.filter((x, i) => {
                    if(x === pr){
                        index = i;
                        return x;
                    }
                })
                update_skus.splice(index, 1)
                console.log("NO")
            }
        }) 
        return  update_skus;
     
    } catch (err) {
      console.log('delete', err);
    }
}

let last_skus = await delete_products();
async function add_new_skus(){
    try{
        last_skus.map(async sku =>{
            let add = await shop.collect.create({
                product_id: sku,
                collection_id: collect_id,
              }).catch(err=>{
                  console.log(err)
              });
        })
    } catch(err){
        console.log(err)
    }
   
}
let final = await add_new_skus();
console.log(last_skus)
console.log(new_skus.length, update_skus.length)
console.log("FINAL")
}

main();
