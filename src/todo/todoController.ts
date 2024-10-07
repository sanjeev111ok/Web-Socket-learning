import { Socket } from "socket.io";
import { getSocketIo } from "../../server";
import todoModel from "./todoModel";
import { ITodo, Status } from "./todoTypes";

class Todo{
    private io = getSocketIo(); 
    constructor(){
        this.io.on("connection",(socket:Socket)=>{
            console.log("new client connected !!")
            socket.on("addTodo",(data)=>this.handleAddTodo(socket,data))
            socket.on("deleteTodo",(data)=>this.handleDeleteTodo(socket,data))
            socket.on("updateTodoStatus",(data)=>this.handleUpdateTodoStatus(socket,data))
            socket.on("fetchTodos",()=>this.getPendingTodos(socket))
        })
    }
    private async handleAddTodo(socket:Socket,data:ITodo){
        try {
        const {task,deadLine,status} = data
        await todoModel.create({
            task, 
            deadLine, 
            status
        })
        const todos = await todoModel.find({status :Status.Pending})
        socket.emit("todos_updated",{
            status : "success", 
            data : todos
        })
        
        } catch (error) {
            socket.emit("todo_response",{
                status : "error", 
                error
            })
        }
    }
    private async handleDeleteTodo(socket:Socket,data:{id:string}){
       try {
        const {id} = data 
        const deletedTodo = await todoModel.findByIdAndDelete(id)
        if(!deletedTodo){
            socket.emit("todo_response",{
                status : "error", 
                message : "Todo not found"
            })
            return;
        }
        const todos = await todoModel.find({status:Status.Pending})
        socket.emit("todos_updated",{
            status : "success", 
            data : todos
        })
       } catch (error) {
        socket.emit("todo_response",{
            status : "error", 
            error
        })
       }

    }
    private async handleUpdateTodoStatus(socket:Socket,data:{id:string,status:Status}){
        try {
        const {id,status} = data 
        const todo = await todoModel.findByIdAndUpdate(id,{status})
        if(!todo){
            socket.emit("todo_response",{
                status : "error", 
                message : "Todo not found"
            })
            return 
        }
        const todos = await todoModel.find({status : Status.Pending})
        socket.emit("todos_updated",{
            status : "success", 
            data : todos
        })
        } catch (error) {
            socket.emit("todo_response",{
                status : "error", 
                error
            })
        }

    }

    private async getPendingTodos(socket:Socket){
        try {
        const todos = await todoModel.find({status : Status.Pending})
        socket.emit("todos_updated",{
            status : "success", 
            data : todos
        })
        } catch (error) {
            socket.emit("todo_response",{
                status : "error", 
                error
            })
        }
    }
}

export default new Todo()