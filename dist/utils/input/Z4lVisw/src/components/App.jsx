import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import Create from "./Create";



function App() {

  const [nNote, setNNote] = React.useState([]);
  function addNote(note){
    setNNote((prev => {
      return[
        ...prev,
        note
      ];
    }));
  }

  function delNote(id) {
    setNNote(prev => {
      return prev.filter((i, index) => {
        return index !== id;
      });
    });
  }
  return (
    <div>
      <Header />
      <Create 
        add = {addNote}
      />
      {nNote.map((i, index) => {
      return(<Note  id = {index} key = {index} title={i.title} content={i.content}  del = {delNote} />);
      })}
      <Footer />
    </div>
  );
}

export default App;