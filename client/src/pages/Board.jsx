import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined'
import StarOutlinedIcon from '@mui/icons-material/StarOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Box, IconButton, TextField, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import boardApi from '../api/boardApi'
import EmojiPicker from '../components/common/EmojiPicker'
import Kanban from '../components/common/Kanban'
import { setBoards } from '../redux/features/boardSlice'
import { setFavouriteList } from '../redux/features/favouriteSlice'
import MuiAppBar from '@mui/material/AppBar';
import Sidebar from '../components/common/Sidebar.jsx'
import { styled, useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import { toast } from 'react-toastify';
import Lottie from 'react-lottie';
import animationData from '../assets/images/lf30_editor_obgeniww.json';

let timer
const timeout = 500
const drawerWidth = 250;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);


const Board = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { boardId } = useParams()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sections, setSections] = useState([])
  const [isFavourite, setIsFavourite] = useState(false)
  const [icon, setIcon] = useState('')
  const [ loading, setLoading] = useState(false);

  const boards = useSelector((state) => state.board.value)
  const favouriteList = useSelector((state) => state.favourites.value)

  useEffect(() => {
    
    const getBoard = async () => {
      setLoading(true)
      try {
        const res = await boardApi.getOne(boardId)
        setTitle(res.title)
        setDescription(res.description)
        setSections(res.sections)
        setIsFavourite(res.favourite)
        setIcon(res.icon)
        setLoading(false)
      } catch (err) {
        toast.error(err)
      }
    }
    getBoard()
  }, [boardId])

  const onIconChange = async (newIcon) => {
    let temp = [...boards]
    const index = temp.findIndex(e => e.id === boardId)
    temp[index] = { ...temp[index], icon: newIcon }

    if (isFavourite) {
      let tempFavourite = [...favouriteList]
      const favouriteIndex = tempFavourite.findIndex(e => e.id === boardId)
      tempFavourite[favouriteIndex] = { ...tempFavourite[favouriteIndex], icon: newIcon }
      dispatch(setFavouriteList(tempFavourite))
    }

    setIcon(newIcon)
    dispatch(setBoards(temp))
    try {
      await boardApi.update(boardId, { icon: newIcon })
    } catch (err) {
      alert(err)
    }
  }

  const updateTitle = async (e) => {
    clearTimeout(timer)
    const newTitle = e.target.value
    setTitle(newTitle)

    let temp = [...boards]
    const index = temp.findIndex(e => e.id === boardId)
    temp[index] = { ...temp[index], title: newTitle }

    if (isFavourite) {
      let tempFavourite = [...favouriteList]
      const favouriteIndex = tempFavourite.findIndex(e => e.id === boardId)
      tempFavourite[favouriteIndex] = { ...tempFavourite[favouriteIndex], title: newTitle }
      dispatch(setFavouriteList(tempFavourite))
    }

    dispatch(setBoards(temp))

    timer = setTimeout(async () => {
      try {
        await boardApi.update(boardId, { title: newTitle })
      } catch (err) {
        alert(err)
      }
    }, timeout);
  }

  const updateDescription = async (e) => {
    clearTimeout(timer)
    const newDescription = e.target.value
    setDescription(newDescription)
    timer = setTimeout(async () => {
      try {
        await boardApi.update(boardId, { description: newDescription })
      } catch (err) {
        alert(err)
      }
    }, timeout);
  }

  const addFavourite = async () => {
    try {
      const board = await boardApi.update(boardId, { favourite: !isFavourite })
      let newFavouriteList = [...favouriteList]
      if (isFavourite) {
        newFavouriteList = newFavouriteList.filter(e => e.id !== boardId)
        toast.success('remove from favourite!')
      } else {
        newFavouriteList.unshift(board)
        toast.success('added to favourite!')
      }
      dispatch(setFavouriteList(newFavouriteList))
      setIsFavourite(!isFavourite)
    } catch (err) {
      toast.error(err)
    }
  }

  const deleteBoard = async () => {
    setLoading(true);
    try {
      await boardApi.delete(boardId)

      if (isFavourite) {
        const newFavouriteList = favouriteList.filter(e => e.id !== boardId)
        dispatch(setFavouriteList(newFavouriteList))
      }

      const newList = boards.filter(e => e.id !== boardId)
      if (newList.length === 0) {
        navigate('/boards')
      } else {
        navigate(`/boards/${newList[0].id}`)
      }
      dispatch(setBoards(newList))
      setLoading(false);
      toast.success('Board deleted success!')
    } catch (err) {
      toast.error(err)
    }
  }

  const theme = useTheme();
  
  const [open, setOpen] = useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: animationData,
      rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
      }
  };

  return (
    <>
      <Box sx={{
        display: 'flex',
        // alignItems: 'center',
        // justifyContent: 'space-between',
        // width: '100%'
      }}>
        <AppBar position="fixed" open={open}>
          <Toolbar sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%'
          }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(open && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
            <IconButton variant='outlined' onClick={addFavourite}>
              {
                isFavourite ? (
                  <FavoriteIcon style={{color: '#f1c40f'}} />
                ) : (
                  <FavoriteBorderIcon style={{ color: '#f1c40f'}}/>
                )
              }
            </IconButton>

            <Tooltip title="Delete">
              <IconButton variant='outlined' color='error' onClick={deleteBoard}>
                <DeleteOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <Sidebar handleDrawerClose={handleDrawerClose}/>
        </Drawer>
      
        <Main open={open}>
           {
            loading ? (
              <Box sx={{
                  display:'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  marginTop: {xs: '60%', md: '20%'}
                  // height: props.fullHeight ? '100vh' : '100%'
              }}>
                  {/* <CircularProgress /> */}
                  <Lottie
                      options={defaultOptions}
                      height={200}
                      width={200}
                  />
              </Box>
            ):(
              <Box sx={{ padding: '50px 10px 0px 10px' }}>
              <Box>
                {/* emoji picker */}
                <EmojiPicker icon={icon} onChange={onIconChange}/>
                <TextField
                  value={title}
                  onChange={updateTitle}
                  placeholder='Untitled'
                  variant='outlined'
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-input': { padding: 0 },
                    '& .MuiOutlinedInput-notchedOutline': { border: 'unset ' },
                    '& .MuiOutlinedInput-root': { fontSize: '1rem', fontWeight: '700' }
                  }}
                />
                <TextField
                  value={description}
                  onChange={updateDescription}
                  placeholder='Add a description'
                  variant='outlined'
                  multiline
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-input': { padding: 0 },
                    '& .MuiOutlinedInput-notchedOutline': { border: 'unset ' },
                    '& .MuiOutlinedInput-root': { fontSize: '0.8rem' }
                  }}
                />
              </Box>
              <Box>
                {/* Kanban board */}
                <Kanban data={sections} boardId={boardId} />
              </Box>
            </Box>
            )
           }
        </Main>
      </Box>

    </>
  )
}

export default Board