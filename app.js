

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const PORT = process.env.PORT || 3000;


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-aashish:Test123@cluster0.vh8rq.mongodb.net/todoListDB");

const itemSchema = {
    name: String
};

const Item = mongoose.model("item", itemSchema);

const item1 = new Item({
    name: "Welcome ot yout ToDo-List"
});
const item2 = new Item({
    name: "Click + to add new item"
});
const item3 = new Item({
    name: "<- Click to delete the item"
});

const defaultItems = [item1, item2, item3];


const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("list", listSchema);



app.get("/", function(req, res){

    Item.find({}, function(err, items){
        if(items.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                } else{
                    console.log("successfully added the items to the database!");
                }
            });
            res.redirect("/");
        } else{
            res.render("lists",{titleList: "Today" , newItems:items});
        }
        
    });
    
    
    
});

app.post("/", function(req,res){
    let itemName = req.body.item;
    let chn = req.body.button;

    const newItem = new Item({
        name: itemName
    });

    if(chn === "Today"){
        
        newItem.save();
        res.redirect("/");
        
    }else{
        List.findOne({name: chn}, function(err, found){
            found.items.push(newItem);
            found.save();
            res.redirect("/"+chn);
        });
    }
    
});

app.post("/delete", function(req, res){
    
    const selectedId = (req.body.checkbox);
    const listName = req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndRemove((selectedId), function(err){
            if(!err){
                console.log("Successfully Deleted!");
                res.redirect("/");
            }
        });
    } else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: selectedId}}}, function(err){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
    
});



app.get("/:work", function(req,res){
    // res.render("lists", {titleList: "Work List", newItems:work})
    const requested = _.capitalize(req.params.work);

    

    List.findOne({name: requested}, function(err, found){
        if(!err){
            if(!found){
                const list = new List({
                    name: requested,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/"+requested);
            } else{
                res.render("lists",{titleList: found.name, newItems: found.items})
            }
        };
    });
});

app.get("/about",function(req,res){
    res.render("about");
})



app.listen(PORT , function(){
    console.log("The server is up at "+PORT);
});
