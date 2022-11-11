import React from 'react';
import { Box, CircularProgress} from '@mui/material';
import Lottie from 'react-lottie';
import animationData from '../../assets/images/lf30_editor_obgeniww.json';

const Loading = props => {

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
    }
};

  return (
    <Box sx={{
        display:'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: props.fullHeight ? '100vh' : '100%'
    }}>
        {/* <CircularProgress /> */}
        <Lottie
            options={defaultOptions}
            height={200}
            width={200}
        />
    </Box>
  )
}

export default Loading