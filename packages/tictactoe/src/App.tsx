import React, { useState } from 'react'
import './App.css'

import Game from './components/Game';

function App() {
  return (
    <>
      <h1>Tic Tac Toe</h1>
      <div className="card">
        <Game />
      </div>
    </>
  )
}

export default App
