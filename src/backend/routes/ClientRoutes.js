const express =require("express");
const router = express.Router();
const Client = require("../models/Clients");


// CREATE CLIENT
router.post("/", async (req, res) => {
    try {   
        const client=await Client.create(
            req.body
        );
        res.status(201).json(client);
    }
    catch (error) {
        console.error("Error creating client:", error);
        res.status(500).json({ message: "Failed to create client" });
    }
});


//GET ALL CLIENTs

router.get("/",
    async(req,res)=>{
        try{
            const client=await Client.find().sort({createdAt:-1});
            res.json(client)
        }
        catch(error){
            console.error("Error fetching clients:", error);
            res.status(500).json({ message: "Failed to fetch clients" });
        }
    });

  


    module.exports=router;