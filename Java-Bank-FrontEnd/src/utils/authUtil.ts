import Cookies from 'js-cookie';

const apiUrl = 'https://82.41.19.127:8080/api/accs/1';

export const isAuthenticated = async () => {
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('jwt')}`,
      },
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
