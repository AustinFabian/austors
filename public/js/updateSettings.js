import axios from 'axios'
import {showAlert} from '/alert'

// type is either 'password' or 'data'
export const updateSettings = async (data,type) => {

    const url = type === 'password' ? '/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe'

    try {
      const res = await axios({
        method: 'PATCH',
        url,
        data
      });

      if(res.data.status === 'Success'){
          showAlert('success',`${type} changed succesfully`);
          location.reload(true) 
      }
    } catch (err) {
      showAlert('error',err.response.data.message);
    }
  };

  // CREATING TOUR ENGINE
  export const createTour = async (data) => {

    const url = `/api/v1/tours`;

    try {
      const res = await axios({
        method: 'POST',
        url,
        data
      });
      
      if(res.data.status === 'success'){
          location.reload(true) 
      }
    } catch (err) {
      console.log('error',err.response.data.message);
    }
  };

  // UPDATING TOUR ENGINE
  export const updateTour = async (data,tourId) => {

    const url = `/api/v1/tours/${tourId}`;

    try {
      const res = await axios({
        method: 'PATCH',
        url,
        data
      });
      
      if(res.data.status === 'success'){
          location.reload(true) 
      }
    } catch (err) {
      console.log('error',err.response.data.message);
    }
  };

