import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import {
  Box,
 ListItem,
  ListItemText,
 Paper,
 
  Button,
  ListItemIcon,
 
  List,
 
  Grid,
} from '@material-ui/core';

import { useRouter } from 'next/dist/client/router';
import Navbar from '../components/Navbar';
import CustomDrawer from '../components/customDrawer';
import { ComponentProps } from '../pages/_app';



const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      // flexGrow: 1,
      backgroundColor: '',
      minHeight: '80vh',
      margin: 'auto',
      padding: 'auto',
      paddingBottom: '6px',
      [theme.breakpoints.up('md')]: {
        width: '100%',
      },
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    list: {
      marginBottom: theme.spacing(1),
    },
    fullList: {
      width: 'auto',
    },
    sublist: {
      marginLeft: theme.spacing(3),
    },
    paper: {
      width: '80%',
      marginLeft: 'auto',
      marginRight: 'auto',
      marginBottom: theme.spacing(4),
      padding: theme.spacing(2),
      borderRadius: '25px',
      [theme.breakpoints.down('md')]: {
        width: '96%',
      },
    },
    textField: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
    },

    button: {
      margin: 'auto',
    },

    heading: {
      color: 'black',
      marginBottom: theme.spacing(4),
      paddingTop: '40px',
    },
    subHeading: {
      color: '#001831',
      fontSize: '1.2rem',
    },
    details: {
      textAlign: 'center',
    },
    center: {
      width: 'fit-content',
      margin: 'auto',
    },

    text: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.down('md')]: {
        marginTop: '165px',
        marginLeft: theme.spacing(2),
      },
    },
    review: {
      padding: theme.spacing(2, 1),
      height: theme.spacing(6),
      width: theme.spacing(6),
      position: 'relative',
      borderRadius: '50%',
    },
    box: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      WebkitTransform: 'translate(-50%, -50%)',
    },
  })
);


const Instructions: React.FC<ComponentProps> = ({ viewer, setSuccessMessage, setErrorMessage }) => {
  const classes = useStyles();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const quizHandle = () => {
    router.push('/dashboard/test');
  };

  return (
    <div className={classes.root}>
      <CustomDrawer
        name={viewer.name}
        username={viewer.email}
        open={open}
        setOpen={setOpen}
        setSuccessMessage={setSuccessMessage}
        setErrorMessage={setErrorMessage}
      />
      <Navbar
        setOpen={setOpen}
        setSuccessMessage={setSuccessMessage}
        setErrorMessage={setErrorMessage}
      />
      <Grid container onClick={() => setOpen(false)}>
        {/* <CustomDrawer name={'Devansh'} username={'Devansh'} open={open} setOpen={setOpen} /> */}
        <Grid container alignItems="center" justify="center">
          <Box>
            <ListItem className={classes.heading}>
              <ListItemText
                primary={'Instructions'}
                primaryTypographyProps={{ variant: 'h3', align: 'center' }}
                secondary={`Here are some Instructions for ISTE's multi city quiz competition: ChimeraX`}
                secondaryTypographyProps={{ className: `${classes.subHeading}`, align: 'center' }}
              />
            </ListItem>
          </Box>
        </Grid>
        <Grid container alignItems="center" justify="center">
          <Box>
            <Paper className={classes.paper} elevation={8}>
              <List component="nav" aria-label="Instructions for Test">
                <ListItem>
                  {/* <ListItemIcon></ListItemIcon> */}
                  <ListItemText>
                    1{')'} The test will begin at 4 pm, and end at 4:35 pm
                  </ListItemText>
                </ListItem>{' '}
                <ListItem>
                  {/* <ListItemIcon></ListItemIcon> */}
                  <ListItemText>2{')'} There can be a maximum of 2 members in a team.</ListItemText>
                </ListItem>{' '}
                <ListItem>
                  {/* <ListItemIcon></ListItemIcon> */}
                  <ListItemText>
                    3{')'} The quiz will automatically submit once the timer runs out.
                  </ListItemText>
                </ListItem>{' '}
                <ListItem>
                  {/* <ListItemIcon></ListItemIcon> */}
                  <ListItemText>
                    4{')'} Replacement of any participant of a team is not allowed after
                    registration.
                  </ListItemText>
                </ListItem>{' '}
                <ListItem>
                  {/* <ListItemIcon></ListItemIcon> */}
                  <ListItemText>
                    5{')'} Make sure to save your answers whenever a question is attempted.
                  </ListItemText>
                </ListItem>
                <ListItem>
                  {/* <ListItemIcon></ListItemIcon> */}
                  <ListItemText>
                    6{')'} Each correct question gets __ marks and no marks are deducted for a wrong
                    answer.
                  </ListItemText>
                </ListItem>
                <ListItem>
                  {/* <ListItemIcon></ListItemIcon> */}
                  <ListItemText>7{')'} There are 30 questions, all are compulsory.</ListItemText>
                </ListItem>
                <ListItem>
                  {/* <ListItemIcon></ListItemIcon> */}
                  <ListItemText>
                    8{')'} The team leader and team helper both will be able to see the questions
                    but only the team leader can answer.
                  </ListItemText>
                </ListItem>
                <ListItem>
                  {/* <ListItemIcon></ListItemIcon> */}
                  <ListItemText>
                    <Grid container alignItems="center" className={classes.list}>
                      <Box>
                        <Paper
                          elevation={6}
                          className={classes.review}
                          style={{ backgroundColor: 'green', color: 'white' }}
                        >
                          <Box className={classes.box}>15</Box>
                        </Paper>
                      </Box>
                      <Box pl={2}>Answered Questions</Box>
                    </Grid>
                    <Grid container alignItems="center" className={classes.list}>
                      <Box>
                        <Paper
                          elevation={6}
                          className={classes.review}
                          style={{ backgroundColor: 'red', color: 'white' }}
                        >
                          <Box className={classes.box}>8</Box>
                        </Paper>
                      </Box>
                      <Box pl={2}>Questions not answered</Box>
                    </Grid>
                    <Grid container alignItems="center" className={classes.list}>
                      <Box>
                        <Paper
                          elevation={6}
                          className={classes.review}
                          style={{ backgroundColor: 'blue', color: 'white' }}
                        >
                          <Box className={classes.box}>5</Box>
                        </Paper>
                      </Box>
                      <Box pl={2}>Questions marked for review</Box>
                    </Grid>
                    <Grid container alignItems="center">
                      <Box>
                        <Paper
                          elevation={6}
                          className={classes.review}
                          style={{ backgroundColor: 'white', color: 'grey' }}
                        >
                          <Box className={classes.box}>2</Box>
                        </Paper>
                      </Box>
                      <Box pl={2}>Questions not visited</Box>
                    </Grid>
                  </ListItemText>
                </ListItem>
              </List>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default Instructions;
