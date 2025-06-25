import express from "express";
import cloudinary from "../lib/cloudinary.js";
import MyBook from "../models/MyBook.js"
import protectRoute from "../middleware/authMiddleware.js";
import Book from "../models/MyBook.js";

const router= express.Router();

router.post("/",protectRoute,async(req,res)=>{
    try {
    
        const {title,caption,rating,image}=req.body;
        if(!image || !title || !caption || !rating) return res.status(400).json({message:"Please provide all fields"});

        //upload image to cloudinary
        const uploadResponse=await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;
        const newBook = new MyBook({
            title,
            caption,
            rating,
            image:imageUrl,
            user:req.user._id
        })

        await newBook.save();
        res.status(201).json({message:"book saved",book:newBook});
    } catch (error) {
        
    }
})

router.get("/",protectRoute,async(req,res)=>{
    try {
        const page=req.query.page||1;
        const limit=req.query.limit||5;
        const skip = (page-1)*limit;

        const books = await MyBook.find().sort({createdAt:-1})
        .skip(skip)
        .limit(limit)
        .populate("user","username profileImage");

        const total=await MyBook.countDocuments();
        
        res.json({
            books,
            currentPage:page,
            totalBooks:total,
            totalPages:Math.ceil(total / limit)
        })
    } catch (error) {
        res.status(500).json({message:"internal server error"});
    }
})

//get recommended books by the logged in user
router.get("/user",protectRoute,async(req,res)=>{
    try {

        const books= await MyBook.find({user:req.user._id}).sort({createdAt:-1});
       if(books.length ===0) return res.status(401).json({message:"You haven't posted any books yet"})

        res.json(books);
        
    } catch (error) {
        res.status(500).json({message:"Internal sever error"}); 
    }
})

router.delete('/:id',protectRoute,async(req,res)=>{
    try {
        const book = await MyBook.findById(req.params.id);
        if(!book) return res.status(404).json({message:"Book not found",});

        //check if the user is the creator of the book
        if(book.user !== req.user._id) 
            return res.status(401).json({message:"You are not authorized to delete book"});

        // delete image from clodinary
        if(book.image && book.image.includes("cloudinary"))
        {
            try {
                const publicId=book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.log("Error deleting from cloudinary",error);
            }
        }

        await book.deleteOne();

        res.json({message:"book deleted succesfully"});
    } catch (error) {
      res.status(500).json({message:"Internal sever error"});  
    }
})

export default router;