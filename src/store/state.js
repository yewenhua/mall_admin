export default {
    loading: false,
    userInfo: sessionStorage.getItem('userInfo') ? JSON.parse(sessionStorage.getItem('userInfo')) : {name: '', desc: '', email: ''},
    token: sessionStorage.getItem('token') ? JSON.parse(sessionStorage.getItem('token')) : '',
    permissions: sessionStorage.getItem('permissions') ? JSON.parse(sessionStorage.getItem('permissions')) : [],
    ball: {
        left: 0,
        bottom: 0
    },
    sitename: '多商户分销拼团',
    baseURL: 'http://www.mall.com/api/',
    domainUrl: 'http://www.mall.com',
    collapse: false,
    activeIndex: sessionStorage.getItem('activeIndex') ? sessionStorage.getItem('activeIndex') : '/admin/user',
}