const express= require('express');
const router=express.Router();
const notificationSchema=require('../models/CommunicationModels.js/Notifications');

//Get Notification
router.get("/", async (req, res) => {
    try {
        const result = await notificationSchema
            .find()
            .sort({ createdAt: -1 });

        res.status(200).json(result);

    } catch (error) {
        console.error("Not Get Notification:", error);

        res.status(500).json({
            message: error.message,
        });
    }
});

//Create Notifications

router.post("/",async(req, res)=>{
    try{
        const result= await notificationSchema.create(
            req.body
        )
        res.status(200).json(result);
    }
    catch(error){
        console.error("Error Notification:", error);
        res.status(500).json({
            message:error.message
        });
    }
});

module.exports=router;