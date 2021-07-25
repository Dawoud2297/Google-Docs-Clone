const mongoose = require('mongoose')
const Document = require('./model')

mongoose.connect('mongodb://localhost/Google-Docs-Clone',{ useNewUrlParser: true ,useUnifiedTopology: true ,useFindAndModify : false})

const io = require('socket.io')(3009,{
    cors:{
        origin : ["http://localhost:3000","http://192.168.1.6:3000"],
        methods : ["GET", "POST"]
    }
})

const defaultValue = ''

io.on('connection',socket=>{
    socket.on('get-document',async documentId=>{
        const document = await getAndCreate(documentId)
        socket.join(documentId)
        socket.emit('load-document',document.element)
        
        socket.on('send-change',delta=>{
            socket.broadcast.to(documentId).emit('receive-change',delta)
        })

        socket.on('save-change',async element=>{
            await Document.findByIdAndUpdate(documentId,{element})
        })
    })
})

async function getAndCreate(id){
    if(id == null)return 
    const document = await Document.findById(id)

    if(document)return document

    return await Document.create({_id : id , element : defaultValue})
}