import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { Amplify, API, graphqlOperation } from 'aws-amplify';
import awsconfig from './aws-exports';
import { TextField, withAuthenticator } from '@aws-amplify/ui-react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { listNotes } from './graphql/queries';
import { useState } from 'react';
import { updateNote, createNote, deleteNote } from './graphql/mutations';

import { v4 as uuid } from 'uuid';


import { Paper, IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PublishIcon from '@material-ui/icons/Publish';


Amplify.configure(awsconfig);

function App() {
  // userState(): saving the state
  const [ notes, setNotes ] = useState([]);

  const [ showAddNote, setShowAddNewNote ] = useState(false);

  // use effect hook to trigger this fetchNotes every time in app(), useEffect() can data fetching, setting up a subscription, chaning the DOM, logging
  useEffect(() => {
    fetchNotes();  
  }, []); 

  // get all the notes from the database into notes state, async() can wait untill promise be finished
  const fetchNotes = async() => {
    try {
      // The await operator is used to wait for a Promise and get its fulfillment value.
      // value listNotes come from graphql queries.js which using graphqlOperation()
      // API from aws-amplify
      const noteData = await API.graphql(graphqlOperation(listNotes));
      // take each of items from listNotes
      const noteList = noteData.data.listNotes.items;
      console.log('note list', noteList);
      setNotes(noteList);
    } catch (error) {
        console.log('error on fetching notes', error);
    }
  }

  return (
    <Authenticator>
      {({ signOut }) => (
        
          <div className="App">
            <header className="App-header">
              <h2 className='wel'>Notes App</h2>
            </header>

            {/* <div className='add'>
              <form>
                <div className='form-control'>
                  <label id='title' className='title'>Title</label>
                  <input type="text" id='titletext' placeholder='Add title here'/>
                </div>

                <div className='form-control'>
                  <label id='descript' className='descript'>Descript</label>
                  <input type='text' id='descripttext'  placeholder='Add descript here'/>
                </div>

                <button id='addNote' className='addNote'>Add Notes</button>
              </form>
            </div> */}
            
            <div className='noteList'>
              { notes.map(note => {
                return (
                  <Paper variant="outlined" elevation={2}>
                    <div className='noteCard'>
                      <div className='noteTitle'>{note.title}</div>
                      <div className='noteDescreption'>{note.description}</div>
                      <Button variant="outlined" startIcon={<DeleteIcon />}>
                        Delete
                      </Button>
                    </div>
                  </Paper>
                )
              })}
            </div>
            
            <br />
            {
              showAddNote ? (
                <AddNote onUpload={() => {
                  setShowAddNewNote(false);
                  fetchNotes();
                }} />
              ): (
              <IconButton onClick={() => setShowAddNewNote(true)}>
                <AddIcon />
              </IconButton>
            )}
              
            <button className='signOut' onClick={signOut}>Sign Out</button>
          </div>
      )}
    </Authenticator>
  );
}

// // declare
// let titletext = document.getElementById("#titletext");
// let descripttext = document.getElementById("#descripttext");
// let addNote = document.querySelector(".addNote");
// let noteElem = document.querySelector(".notes");

// // function using innerHTML to get user input
// if (titletext) {
//   console.log(titletext, descripttext);
//   addNote.addEventListener("click", (e)=> {
//   // to get tile from user input
//     e.preventDefault();
//     addNotes();
//   })
// }
// // create a new div and add new title and descript into this div
// function addNotes() {
//   let titlevalue = titletext.value;
//   let descriptvalue = descripttext.value;
//   let c = document.createElement("div");

//   c.classList.add("c");
  
//   c.innerHTML='<h3>${titlevalue}</h3> <p>${descriptvalue}</p> <button className="del">Delete</button>'
//   noteElem.appendChild(c);
  
// }


export default withAuthenticator(App);

const AddNote = ({ onUpload }) => {
  // notedate for store new note
  const [ noteData, setNoteData ] = useState({});

  // using await API graphql(graphqlOperation()) input a new creating note include id, title, description
  const uploadNote = async () => {
    // upload the note
    console.log('noteData', noteData);

    // after press the addnote button, upload note
    const { title, description } = noteData;

    // if need to upload file like mp3 file need to storage
    // const [mp3Data, setMp3Data] = useState();
    // const { key } = await Storage.put('${uuid()}.mp3', mp3Data, { contentType: 'audio/mp3'});
    
    const createNoteInput = {
      id: uuid(),
      title,
      description,
    };
    await API.graphql(graphqlOperation(createNote, {input: createNoteInput}));
    onUpload();
  };

  return (
    <div className='newNote'>
      <TextField 
        label='title' 
        value={noteData.title}
        onChange={e => setNoteData({...noteData, title: e.target.value})}
      />

      <TextField 
        label='description' 
        value={noteData.description}
        onChange={e => setNoteData({...noteData, description: e.target.value})}
      />
      <br />
      <IconButton onClick={uploadNote}>
        <PublishIcon />
      </IconButton>
    </div>
  );
};