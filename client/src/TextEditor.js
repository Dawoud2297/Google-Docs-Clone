import React, { useCallback ,useEffect,useState} from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { io } from 'socket.io-client'

import { useParams } from 'react-router-dom'

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
  ]

export default function TextEditor() {
    const [socket, setSocket] = useState()
    const [quill, setQuill] = useState()
    const { id : documentId } = useParams()
    console.log(documentId)
    
    useEffect(()=>{
        const s = io('http://localhost:3009')
        setSocket(s)
        return ()=>{
            s.disconnect()
        }
    },[])

    useEffect(()=>{
        if(quill == null || socket == null)return 
        socket.once('load-document',document=>{
            quill.setContents(document)
            quill.enable()
        })
        socket.emit('get-document',documentId)
    },[socket,quill,documentId])


    useEffect(()=>{
        if(quill == null || socket == null)return 

        const interval = setInterval(()=>{
            socket.emit('save-change',quill.getContents())
        },1000)
        return ()=>{
            clearInterval(interval)
        }
    },[quill,socket])

    useEffect(()=>{
        if(quill == null || socket == null)return 
        const handler1 = (delta,oldDelta,source)=>{
            if(source !== "user")return 

            socket.emit('send-change',delta)
        } 
        const handler2 = delta=>{
            quill.updateContents(delta)
        }
        quill.on('text-change',handler1)
        socket.on('receive-change',handler2)
        return ()=>{
            quill.off('text-change',handler1)
            socket.off('receive-change',handler2)
        }
    },[socket,quill])

    const Wrapper = useCallback(wrapper=>{
        if( wrapper == null)return 
        wrapper.innerHTML = ''
        const editor = document.createElement('div')
        wrapper.append(editor)
        const q = new Quill(editor,{theme : 'snow',modules:{toolbar : TOOLBAR_OPTIONS}})
        setQuill(q)
        q.disable()
        q.setText('...loading')
    },[])
    return (
        <div className="container" ref={Wrapper}></div>
    )
}
