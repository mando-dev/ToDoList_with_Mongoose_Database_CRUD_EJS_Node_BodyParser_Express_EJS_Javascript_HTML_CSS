//jshint esversion:6 i fuck you asss fuck 
const express = require("express");//creating a repo on git is like opening up a bucket
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash"); //lodash gets tapped into by using this underscore

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true})); // do heavy web until you get a job
app.use(express.static("public"));          //we are hosting databases in our cloud!!
mongoose.connect("mongodb+srv://admin-mando:vcJDzjmE74Xu5Zl4@cluster0.0olwf.mongodb.net/todolistDB", {useNewUrlParser: true});//creting a new database inside mongodb

const itemsSchema = {name: String};               // no need to capitalize when creating shcema. We capitalize when creating the singular form of a model as shown below           
const Item = mongoose.model("Item", itemsSchema );      // creating new mongoose model based on the schema itemSchema

const item1 = new Item ({ name: "Welcome to your to dolist" }); // new doc creted // specifing the values of our fields for the schema   //binding the const to the model. Creating a new document from our new model 
const item2 = new Item ({name: "Hit the + button to add a new item" });  // new doc creted    // specifing the values of our fields for the schema                      //binding the const to the model. Creating a new document from our new model 
const item3 = new Item ({ //binding the const to the model. Creating a new document from our new model 
name: "<-- -hit this to delete an aitem" // specifing the values of our fields for the schema 
}); // new doc creted

const defaultItems = [item1, item2, item3];              //putting all our items/docs from abbove into an an array. we trnna insert all these into our item collection
const listSchema = { name: String, items: [itemsSchema]}; // array of items             ///////////so we have a List Schema and Item schema. this will take in two fields                                         
const List = mongoose.model("List", listSchema);         //mongoose model. This model was created from the list schema right abvoe

app.get("/", function(req, res) {                        // this is our root route. so this find method triggers whenever we access home route. // we only need to load our default items once and keep it from repeating
      Item.find({},function(err, foundItems){            //we leave {} empty since this is where the docs will be laoded. 'foundItems' is a dummy variable, it will containt all the items we found in our collection. 'Item' is ralting to our item collections. find() shoots us back an array
      if (foundItems.length === 0)  {                    //checking to see if array is empty or not, if so thenm load up the default data
              Item.insertMany(defaultItems, function(err){ //to put something in the items collection we have to refer to the Item model
                if(err){
                  console.log(err);
                  } else{
                  console.log("sucessfully saved default items to DB")
                  }
                  });
                  res.redirect("/");                   // this helps display our defaul data unto our root page
                  } else {
                  res.render("list", {listTitle: "Today", newListItems: foundItems});         // the "list" represents our list.ejs file, we are passing the 'items' array over to our ejs. The forEach/for lopp on app.js is where we are passing in these 'foundItems'. These 'foundItems' have been passed into our root route. This accepts a call back.
                  }
                  });//find all documents items and send over to our ejs to render in our tododlist. 
                  });
  app.get("/:customListName", function(req, res){  //. we are doing lodash to capitalize first letter. this is a user trying to access a custom list name. use express route parameters, so create a dynamic route. We should be able to print(localhost:3000/Home ) the last part of the url inside our app.get. customListName is a dummy variable that allows users to customize their lists?
      const customListName = _.capitalize (req.params.customListName);   // parameter has to to with what the user has typed in. //creating a new document and will have a slightly different schema than our item schema
      
      List.findOne({name: customListName}, function(err, foundList){// the reason we are adding the 'customListName', its because its going to find a list inside the collections of list that has the name that the current user is trying to access. We are calling findOne on our list model. So the findOne() is basically looking for a match of the customListName
          if (!err) {                    //'foundList' is the result of what was found, but first the call back function will try to catch the error
          if (!foundList){                //if foundList doesnt exist, then log that. Cheking to see if there is or inst a foundList-i guess that matches a prior list. we are only getting an object back and not an array
              const list = new List({      //Create new list//new list being cretead based off of our list model 
              name: customListName,       //user customizes the url, for example localhost300/whatever. Here we are gaining accesst o customListName
              items: defaultItems        // thest the items we created for default items
              });
          list.save();//saving into our list collections. This will be sent out to our lsit.ejs
          res.redirect("/" + customListName);//this is where the magic happens! Concatination. this is to display users their lists. 
                    } else {//customListName will now be the title since thats the custom title the user will be entering
                      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})//show an existing list since it already exists by tapping into our 'foundList'. We are taking in 2 parameters here
                      }//.name and .items are tapping into the properties right above
                      }
                      });       
                    });

app.post("/", function(req, res){                  //this root route is connected to the 'form' in ejs   // we are getting the "newItem" sent over from ejs form on the 'input' section of the form
    const itemName = req.body.newItem;             // this gets triggered when the form or plus icon is pushed by user-look at list.ejs
    const listName = req.body.list;                //tapping into the list name. This is so the right item ends up on the proper list
    const item = new Item ({ name: itemName });    //creating a new item-document based off our model in mongoDB  // specifing the values of our fields for the schema. notice we created 'itemName' a few lines above                                //binding the const to the model. Creating a new document from our new model 
          if (listName === "Today"){               // Today' is the default list
              item.save();                           // we are using this instead of insertMany. This will save our item into our collectionof items
              res.redirect("/");                     //this gets your new items to display at your root page after its saved on db
              } else {                               //else item will be created under the proper custom list. We need to search in our list collection in our db. 
                List.findOne({name: listName}, function(err, foundList){       // so we will grab the item and embed it into the list of item array
                foundList.items.push(item);          // this item being pushed is the one the user just typed in. we are tapping into our foundList and adding our new item. Tapping into embededed array of items. 
                foundList.save();                    //saving our foundList so we updated with the new data
                res.redirect("/" + listName );        //redirecting to where the user came from. SO the user came from /listName            
                });                                   //so on this app.post 2 things in general are happengin, directing user to default home page or custom page whenver they create a new item
                }
                }); 
app.post("/delete", function(req, res){                   //this is a call back. our checkedItemId is storing the ID of item being checked off. 
    const checkedItemId = req.body.checkbox;              // 'checkbox' is the name we gave inside our delete form post inside the <inpu> tag on ejs.  we see what is being sent over from our form inside the ejs file becuase we are using .body
    const listName = req.body.listName;                   //here we are checking the value of our listName. Make sure that your second listName matches the name of the 2nd input in your form in ejs
          if (listName === "Today"){                     //differentiating whether we are deleting item from detault list or custom list
              Item.findByIdAndRemove(checkedItemId, function(err){
              if (!err) {
              console.log("Succesfully Deleted the checked item");
              res.redirect("/");// this is how we get the deleted item to show up on our UI
              }
              });
              } else { //delete item custom list. So first we check for the 'listName' and then we find item with 'checkedItemId'. These are the 2 consts we created earlier. We have to go in the array [itemSchema] to find its particular ID and delete
                  List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err, foundList){   //tapping into our List model. We first specify the condition-whcih is what list we want to find. So findOneAndUpdate will only return us one list, thus its name. The second object is what updated do we wanna make. so for condition we are using listName which is our custom list. next as second paramter we are using $pull. $pull will find the array within the listName list. So the name of that array is 'items' which was defined under a const inside the schema. so from the list we pull the item by its id by accessing 'checkedItemId' which was created as a consta above. As for the error callback, the foundList corresponds to the findOneAndUpdate()
                  if(!err) {
                  res.redirect("/" + listName);
                  }
                  });
                  }
                  }); 
app.get("/about", function(req, res){res.render("about");});

let port = process.env.PORT;  //adding this from heroku site. This is herokus port. 
if (port == null || port == "") { // if herokus port fails then we can set up our own
    port = 3000; //your database is no longer being hosted locally but on mongoDB Atlas via AWS
}

app.listen(port, function() {console.log("Server has started successfully broh");});
