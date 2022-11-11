import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { styled, useTheme } from '@mui/material/styles';
import { Box, Drawer, IconButton, List, ListItem, ListItemButton, Typography, Tooltip } from '@mui/material'
import { Link, useNavigate, useParams } from 'react-router-dom' 
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';

import Logo from '../../assets/images/favicon.png'
import assets from '../../assets/index'
import { setBoards } from '../../redux/features/boardSlice'
import FavouriteList from './FavouriteList'
import boardApi from '../../api/boardApi'
import authApi from '../../api/authApi'
import { toast } from 'react-toastify';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import LoadingButton from '@mui/lab/LoadingButton'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));



const Sidebar = ({handleDrawerClose}) => {
  const theme = useTheme();
  const user = useSelector((state) => state.user.value)
  const boards = useSelector((state) => state.board.value)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { boardId } = useParams()
  const [activeIndex, setActiveIndex] = useState(0)
  const [open, setOpen] = useState(false);
  const [ loading, setLoading] = useState(false);

  const sidebarWidth = 250
 
  //getScreenSize
  const [screenSize, getDimension] = useState({
    dynamicWidth: window.innerWidth,
    dynamicHeight: window.innerHeight
  });
  const setDimension = () => {
    getDimension({
      dynamicWidth: window.innerWidth,
      dynamicHeight: window.innerHeight
    })
  }
  useEffect(() => {
    window.addEventListener('resize', setDimension);
    
    return(() => {
        window.removeEventListener('resize', setDimension);
    })
  }, [screenSize])

  const handleDialogOpen = () => {
    handleClose();
    if(screenSize.dynamicWidth < 700) {
      handleDrawerClose()
    };
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const getBoards = async () => {
      try {
        const res = await boardApi.getAll()
        dispatch(setBoards(res))
      } catch (err) {
        alert(err)
      }
    }
    getBoards()
  }, [dispatch])

  useEffect(() => {
    const activeItem = boards.findIndex(e => e.id === boardId)
    if (boards.length > 0 && boardId === undefined) {
      navigate(`/boards/${boards[0].id}`)
    }
    setActiveIndex(activeItem)
  }, [boards, boardId, navigate])

  const logout = () => {
    setLoading(true);
    localStorage.removeItem('token')
    setLoading(false);
    navigate('/login')
  }

  const onDragEnd = async ({ source, destination }) => {
    const newList = [...boards]
    const [removed] = newList.splice(source.index, 1)
    newList.splice(destination.index, 0, removed)

    const activeItem = newList.findIndex(e => e.id === boardId)
    setActiveIndex(activeItem)
    dispatch(setBoards(newList))

    try {
      await boardApi.updatePositoin({ boards: newList })
    } catch (err) {
      alert(err)
    }
  }

 
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  const deleteAccount = async () => {
    handleClose()
    setLoading(true);
    try {
      await authApi.delete(user._id)
      setLoading(false);
      navigate('/login')
      toast.success('Your account is deleted!')
    } catch (err) {
      toast.error(err)
    }
  }

  const handleClick = () =>{
    if(screenSize.dynamicWidth < 700) {
      handleDrawerClose()
    }else{
      console.log("click")
    }
    
  }

  const addBoard = async () => {
    handleClick();
    try {
      const res = await boardApi.create()
      const newList = [res, ...boards]
      dispatch(setBoards(newList))
      navigate(`/boards/${res.id}`)
      toast.success('Board added success!')
    } catch (err) {
      toast.error(err)
    }
  }


  return (
    <Drawer
      container={window.document.body}
      variant='permanent'
      open={true}
      sx={{
        width: sidebarWidth,
        height: '100vh',
        '& > div': { borderRight: 'none' }
      }}
    >
      <List
        disablePadding
        sx={{
          width: sidebarWidth,
          height: '100vh',
          backgroundColor: assets.colors.secondary
        }}
      >
        <DrawerHeader sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
          }}> 
          <img src={Logo} style={{ width: '50px' }}/>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton> 
        </DrawerHeader>

        <Divider />

        {/* userinfo_sesction */}
        <ListItem>
          <Box sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#76ff03'
          }}>
            <Typography variant='body2' fontWeight='700'>
              {user.username}
            </Typography>

            <Tooltip title="Settings">
              <IconButton 
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu} 
                style={{color: '#76ff03'}}
              >
                  <SettingsIcon fontSize='small'/>
              </IconButton>
            </Tooltip>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={logout} style={{fontSize: '0.9rem'}}>
                   <Typography
                    style={{marginRight: '10px', fontSize: '0.8rem'}}
                   >
                     Logout
                   </Typography>
                   <LogoutOutlinedIcon fontSize='small' style={{color: '#76ff03'}}/>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleDialogOpen}>
                    <Typography
                      style={{marginRight: '10px', fontSize: '0.8rem'}}
                    >
                      Delete Account
                    </Typography>
                    <WarningAmberOutlinedIcon fontSize='small' style={{color: 'red'}}/> 
                </MenuItem>
                <Divider />
                <Tooltip title="Develop with 💛 by Kyaw Zin Htet">
                  <MenuItem onClick={handleClose}>
                      <Typography
                        style={{marginRight: '10px', fontSize: '0.8rem'}}
                      >
                        App Info
                      </Typography>
                      <InfoOutlinedIcon fontSize='small' style={{color: 'white'}}/> 
                  </MenuItem>
                </Tooltip>
            </Menu>

            {/* Confirmdialog */}
            <Dialog
              open={open}
              TransitionComponent={Transition}
              keepMounted
              onClose={handleDialogClose}
              aria-describedby="alert-dialog-slide-description"
            >
              
              <DialogTitle>
                <WarningAmberOutlinedIcon fontSize='small' style={{color: 'yellow'}}/> 
                {"Warning"} 
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                  Are you sure, you want to delete your account?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <LoadingButton
                  sx={{ mt: 4, mb: 3 , color:'#76ff03'}}
                  variant='outlined'
                  fullWidth
                  color='success'
                  onClick={deleteAccount}
                  loading={loading}
                >
                  <CheckOutlinedIcon fontSize='small' style={{color: '#76FF03'}}/> 
                </LoadingButton>
                <LoadingButton
                  sx={{ mt: 4, mb: 3 , color:'#76ff03'}}
                  variant='outlined'
                  fullWidth
                  color='error'
                  onClick={handleDialogClose}
                >
                  <ClearOutlinedIcon fontSize='small' style={{color: 'red'}}/> 
                </LoadingButton>
               
              </DialogActions>
              
            </Dialog>

          </Box>
        </ListItem>

        <Divider style={{width: '80%', marginLeft: '20px'}}/>
        
        {/* favourite_board */}
        <Box sx={{ paddingTop: '10px' }} />
        <FavouriteList handleClick={handleClick}/>

        {/* private_board */}
        <Box sx={{ paddingTop: '10px' }} />
        <ListItem>
          <Box sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant='body2' fontWeight='700'>
              Private
            </Typography>
            <IconButton onClick={addBoard}>
              <AddCircleOutlineIcon fontSize='small' />
            </IconButton>
          </Box>
        </ListItem>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable key={'list-board-droppabl e-key'} droppableId={'list-board-droppable'}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {
                  boards.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <ListItemButton
                          ref={provided.innerRef}
                          {...provided.dragHandleProps}
                          {...provided.draggableProps}
                          selected={index === activeIndex}
                          component={Link}
                          to={`/boards/${item.id}`}
                          sx={{
                            pl: '20px',
                            cursor: snapshot.isDragging ? 'grab' : 'pointer!important',                
                          }}
                          onClick={handleClick}
                          
                        >
                          <Typography
                            variant='body2'
                            fontWeight='700'
                            sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {item.icon} {item.title}
                          </Typography>
                        </ListItemButton>
                      )}
                    </Draggable>
                  ))
                }
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </List>
    </Drawer>
  )
}

export default Sidebar