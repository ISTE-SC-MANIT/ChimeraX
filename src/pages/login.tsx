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
import { GoogleLogin, GoogleLoginResponse } from "react-google-login";
import axios from "axios"
import { withStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import FormDialog from '../components/forgotPassword';
import { blue } from '@material-ui/core/colors';
import useMediaQuery from '@material-ui/core/useMediaQuery';


const SigninButton = withStyles((theme) => ({
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
    backgroundImage: `url('/vector.png')`,
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
    width: '80%',
    height: '200px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(5),
  },
  imageTitle: {
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px `,
    border: '2px solid currentColor',
    borderRadius: '50px',
  },
  imageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white,
  },
  vector: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  imageV: {
    width: '100% !important',
  },
  customButton: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  base: {
    width: '80%',
    marginTop: theme.spacing(2),
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
        <Image
          src="/login.png"
          alt="logo"
          className={classes.imageV}
          width={window.innerWidth}
          height={window.innerWidth / 1.45}
        />
      </Box>
    );
  }
  return (
    <Box className={classes.vector}>
      <Image src="/login.png" alt="logo" className={classes.imageV} width={500} height={345} />
    </Box>
  );
};
export default function SignInSide() {
    const classes = useStyles();
    const [openPass,setOpenPass]=React.useState(false)

    const sendGoogleToken = (tokenId) => {
      axios
        .post(`${process.env.NEXT_PUBLIC_BACKEND}/api/googlelogin`, {
          idToken: tokenId,
        })
        .then((res) => {
          console.log(res.data);
         
        })
        .catch((error) => {
          console.log("GOOGLE SIGNIN ERROR", error.response);
        });
    };

    const responseGoogle = (response:GoogleLoginResponse) => {
      console.log(response);
      sendGoogleToken(response.tokenId);
    }

    return (
      <>
        {openPass && <FormDialog open={openPass} onClose={() => setOpenPass(false)} />}
        <Grid container component="main" className={classes.root}>
          <Grid item xs={false} sm={6} className={classes.image}>
            <Box className={classes.logo}>
              <Image src="/chimerax.png" alt="logo" width={400} height={104} />
            </Box>
            <Box component="span">
              <Grid container justify="center" alignItems="center">
                <SigninButton>Sign In</SigninButton>
              </Grid>
            </Box>
            <VectorImg classes={classes} />
          </Grid>
          <Grid item xs={12} sm={6} component={Paper} elevation={0} square>
            <div className={classes.paper}>
              <Avatar className={classes.avatar}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h2">
                Log In
              </Typography>
              <form className={classes.form} noValidate>
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
                  Log In
                </Button>
                <Grid container>
                  <Grid item xs>
                    <Link onClick={() => setOpenPass(true)} variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href="#" variant="body2">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
                <Box mt={5}>
                  {' '}
                  <Typography align="center" variant="h6">
                    Or Log in with other social platforms
                  </Typography>
                </Box>
                <Box>
                  <Grid container justify="center" alignItems="center">
                    <Grid item className={classes.control}>
                    <GoogleLogin
                  clientId={`${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}`}
                  onSuccess={responseGoogle}
                  onFailure={responseGoogle}
                  cookiePolicy={"single_host_origin"}
                  render={(renderProps) => (
                    <Button onClick={renderProps.onClick} disabled={renderProps.disabled}>
                        <Avatar alt="google" src="/google.png" className={classes.large} />
                      </Button>
                    )}
                ></GoogleLogin>


                     
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
        </Grid>
      </>
    );
}