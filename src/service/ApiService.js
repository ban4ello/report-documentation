import api from '@/service/api';

export default {
  createCalculation({ name = 'promotion', surname = 'surname' }) {
    return api().post('/user', { name, surname });
  }
};
