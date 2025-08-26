import axios from 'axios';

const api = axios.create({
    baseURL: 'http://77.91.77.4:1050/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

//test

export const login = async (username: string, password: string): Promise<{ token: string | null; message: string | null }> => {
    try {
        const response = await api.post('/Admin/User/Login', { username, password });
        if(response.data.responseCode === 200){
            return { token: response.data.value.response.token, message: response.data.message };
        }
        else{
            return { token: null, message: response.data.message };
        }
        
    } catch (error: any) {
        console.error('Login failed', error);
        return { token: null, message: error.response?.data?.message || 'An error occurred' };
    }
};


export const fetchData = async (token: string): Promise<any> => {
    try {
        const response = await api.get('/Admin/Device/BOGetAllDevices', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Fetching data failed', error);
        return null;
    }
};

// تابع برای دریافت جزئیات آیتم با شناسه
export const fetchItemDetails = async (id: number, token: string, pageSize: number, pageNumber: number): Promise<any> => {
    try {
        const response = await api.get(`/Admin/BucketInfo/BOGetBucketInfosById`, {
            headers: {
                Authorization: `Bearer ${token}`,
                id: id.toString(),
                pageSize: pageSize.toString(),
                pageNumber: pageNumber.toString(),
            },
        });
        return response.data;
    } catch (error) {
        console.error('Fetching item details failed', error);
        return null;
    }
};

export const deleteBucket = async (id: number, token: string): Promise<any> => {
    try {
        const response = await api.post(`/Admin/Device/BODeleteDevice`, null, {
            headers: {
                Authorization: `Bearer ${token}`,
                id: id.toString(),
            },
        });
        return response.data;
    } catch (error) {
        console.error('Deleting bucket failed', error);
        return null;
    }
};