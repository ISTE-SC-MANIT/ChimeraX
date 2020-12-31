import * as React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Image from 'next/image'
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { withStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';
import axios from "axios"
import { authenticate } from '../components/utils';
import { useRouter } from 'next/router';
import useMediaQuery from '@material-ui/core/useMediaQuery';


const LoginButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(blue[500]),
    backgroundColor: blue[500],
    border: '2px solid white',
    borderRadius: '50px',
    padding: '10px 20px',
    '&:hover': {
      backgroundColor: blue[700],
    },
  },
}))(Button);

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: `url('/Vector2.png')`,
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  logo: {
    // backgroundImage: `url('/chimerax.png')`,
    width: 'fit-content',
    height: '100px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(5),
  },
  imageTitle: {
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px `,
    border: '2px solid currentColor',
    borderRadius: '20px',
  },
  imageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white,
  },
  imageTitle2: {
    color: theme.palette.common.white,
  },
  vector: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  imageV: {
    width: '100% !important',
    marginLeft: `${theme.spacing(8)} !important`,
    height: '600px',
  },
  customButton: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  base: {
    width: '100%',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(6),
  },
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  control: {
    padding: theme.spacing(1),
  },
}));
const VectorImg = (classes) => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  if (mobile) {
    return (
      <Box className={classes.vector}>
        <Image src="/signin.png" alt="logo" className={classes.imageV} width={window.innerWidth} height={window.innerWidth/1.25} />
      </Box>
    );
  }
  return (
      <Box className={classes.vector}>
        <Image src="/signin.png" alt="logo" className={classes.imageV} width={460} height={367} />
      </Box>
  );
};
export default function SignInSide() {
    const classes = useStyles();
    const [formData,setFormData]=React.useState({email:"",password:"",text:"Sign In"})
    const router = useRouter()
    
    const handleChange = (field:string)=>(e:any)=>{
        setFormData({ ...formData, [field]: e.target.value });
    }

    const handleSubmit = (e:any)=>{
        e.preventDefault();
        setFormData({...formData,text:"Submitting ....."})

        fetch(`http://localhost:8080/api/register`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              //...values,
                     email:formData.email,
          password:formData.password
            }),
          })
            .then((response) => {
            //   return response.json();
         return response.json()
            }).then((body)=>   authenticate(body,()=>{
                router.push("/register")
            }))
            .catch((error) => {
              return error;
            });
    //     axios
    //     .post(`${process.env.NEXT_PUBLIC_BACKEND}/api/register`, {
         
    //       email:formData.email,
    //       password:formData.password
    //     })
    //     .then((res) => {
    //       setFormData({
    //         ...formData,
           
    //         email: "",
           
    //         password: "",
    //         text: "Submitted",
    //       });
    // }
    //)
}

    return (
      <Grid container component="main" className={classes.root}>
        <Grid item xs={12} sm={6} component={Paper} elevation={0} square>
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h2">
              Sign In
            </Typography>
            <form className={classes.form} noValidate onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                variant="outlined"
                onChange={handleChange("email")}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                variant="outlined"
                onChange={handleChange("password")}
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                className={classes.submit}
                color="primary"
              
              >
              {formData.text}
              </Button>

              <Box mt={5}>
                {' '}
                <Typography align="center" variant="h6">
                  Or Sign in with other social platforms
                </Typography>
              </Box>
              <Box>
                <Grid container justify="center" alignItems="center">
                  <Grid item className={classes.control}>
                    <Link href="#">
                      <Avatar alt="google" src="/google.png" className={classes.large} />
                    </Link>
                  </Grid>
                  <Grid item className={classes.control}>
                    <Link href="#">
                      <Avatar alt="fb" src="/fb.png" className={classes.large} />
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </form>
          </div>
        </Grid>

        <Grid item xs={false} sm={6} className={classes.image}>
          <Box className={classes.logo}>
            <Typography
              component="span"
              variant="h3"
              color="inherit"
              className={classes.imageTitle2}
            >
              One of us?
            </Typography>
          </Box>
          <Box component="span">
            <Grid container justify="center" alignItems="center">
              <LoginButton>Log In</LoginButton>
            </Grid>
          </Box>
          <VectorImg classes={classes} />
        </Grid>
      </Grid>
    );
}