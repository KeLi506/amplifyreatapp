import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { Amplify, API, graphqlOperation, Storage } from 'aws-amplify';
import awsconfig from './aws-exports';
import { TextField, withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { listNotes } from './graphql/queries';

import { updateNote, createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';

import { v4 as uuid } from 'uuid';


import { Paper, IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PublishIcon from '@material-ui/icons/Publish';

Amplify.configure(awsconfig);

const initialFormState = { name: '', description: ''};

function App() {
  // userState(): saving the state
  const [ notes, setNotes ] = useState([]);
  // const [ formData, setFormData ] = useState(initialFormState);

  const [ showAddNote, setShowAddNewNote ] = useState(false);

  // use effect hook to trigger this fetchNotes every time in app(), 
  // useEffect() can data fetching, setting up a subscription, chaning the DOM, 
  // logging
  useEffect(() => {
    fetchNotes();  
  }, []);

  // using API class to sent a query to Graphql API and retrieve a list of notes
  // async() can wait untill promise be finished
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

  // same as above
  // async function fetchNotes() {
  //   const apiData = await API.graphql({query: listNotes});
  //   setNotes(apiData.data.listNotes.items);
  // }

  // if only wants to create a note
  // async function createNote() {
  //   if (!FormData.title || !FormData.description) return;
  //   await API.graphql({ query: createNoteMutation, variables: { input: formData}});
  //   setNotes([ ...notes, formData]);
  //   setFormData(initialFormState); 
  // }

  // to delete the note according id
  async function deleteNote({id}) {
    const newNoteArray = notes.filter(note => note.id != id);
    setNotes(newNoteArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: {id}}});
  }

  return (
    <Authenticator>
      {({ signOut }) => (
          <div className="App">
            <header className="App-header">
              <h2 className='wel'>Notes App</h2>
            </header>

            {/* <div className='add'>
              <input 
                onChange={e => setFormData({ ...formData, 'title': e.target.value})}
                placeholder='Note title'
                value={formData.title}
              />

              <input 
                onChange={e => setFormData({ ...formData, 'description': e.target.value})}
                placeholder='Note description'
                value={formData.description}
              />

              <button onClick={createNote}>Create Note</button>
            </div> */}
            
            <div className='noteList'>
              { notes.map((note) => {
                return (
                  <Paper key={note.id} variant="outlined" elevation={0}>
                    <div className='noteCard'>
                      <div className='noteTitle'>{note.title}</div>
                      <div className='noteDescreption'>{note.description}</div>
                      <Button variant="outlined" startIcon={<DeleteIcon />} onClick={()=> deleteNote(note)}>
                        Delete
                      </Button>
                    </div>
                  </Paper>
                )
              })}
            </div>

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
    
    // init what the information need to create
    const createNoteInput = {
      id: uuid(),
      title,
      description,
    };
    await API.graphql(graphqlOperation(createNoteMutation, {input: createNoteInput}));
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
