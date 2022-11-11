import LoadingButton from '@mui/lab/LoadingButton'
import { Box } from '@mui/material'
import React from 'react'
import { useDispatch } from 'react-redux'
import { setBoards } from '../redux/features/boardSlice'
import { useNavigate } from 'react-router-dom'
import boardApi from '../api/boardApi'
import { useState } from 'react'


const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [ loading, setLoading] = useState(false)

  const createBoard = async() =>{
    setLoading(true);
    try{
      const res = await boardApi.create()
      dispatch(setBoards([res]))
      navigate(`/boards/${res.id}`)
    }catch(err){
      alert(err)
    }finally{
      setLoading(false)
    }
  }
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop:{xs: '50%', md: '15%'}
      }}
    >
      <LoadingButton
        sx={{ mt: 3, mb: 2 ,color:'#76ff03'}}
        variant='outlined'
        onClick={createBoard}
        loading={loading}
        
      >
        Click here to create your first board
      </LoadingButton>
    </Box>
  )
}

export default Home