import Task from "../models/task.model.js"
import {asynchandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";


// Create a new task

const createTask= asynchandler(async(req,res)=>{
    const {title,description,priority,status,dueDate}=req.body

    if(!title){
        throw new ApiError(400,"Task title is required")
    }

    const task= await Task.create({
        title,
        description,
        priority,
        status,
        dueDate,
        owner:req.user._id
    })

    res.status(201).json({
        success:true,
        message:"Task created successfully",
        data:task
    })
});

// Get all tasks

const getTasks= asynchandler(async(req,res)=>{
    const tasks= await Task.find({owner:req.user._id}).sort("-createdAt");
    res.status(200).json({
        success:true,
        count:tasks.length,
        data:tasks
    })
})

const getTaskById= asynchandler(async(req,res)=>{
    const task= await Task.findOne({
        _id:req.params.id,
        owner:req.user._id,
    });
    if(!task){
        throw new ApiError(404,"Task not found")
    }

    res.status(200).json({
        success:true,
        data:task
    })
})

// Update a task

const updateTask = asynchandler(async(req,res)=>{
    const {title,description,priority,status,dueDate,completed}=req.body

    const task= await Task.findOneAndUpdate(
        {_id:req.params.id, owner:req.user._id},
        {title,description,priority,status,dueDate,completed},
        {new:true,runValidators:true}
    );
    if(!task){
        throw new ApiError(404,"Task not found")
    }

    res.status(200).json({
        success:true,
        message:"Task updated successfully",
        data:task
    })
});

// Delete a task

const deleteTask= asynchandler(async(req,res)=>{
    const task= await Task.findOneAndDelete(
        {_id:req.params.id, owner:req.user._id}
    );

    if(!task){
        throw new ApiError(404,"Task not found")
    }
    res.status(200).json({
        success:true,
        message:"Task deleted successfully",
        data:null
    })
})

export  {createTask,getTasks,getTaskById,updateTask,deleteTask}