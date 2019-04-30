import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store/'

// import Frame from './frame/Frame.vue'
// import Privilege from './privilege/Privilege.vue'
// import Role from './privilege/Role.vue'
// import User from './privilege/User.vue'
// import Login from './personal/Login.vue'
// import Personal from './personal/Personal.vue'
// import MyAgents from './personal/MyAgents.vue'
//
// import Userinfo from './page/Userinfo.vue'
// import Chgpwd from './page/Chgpwd.vue'
//
// import Discount from './page/Maintenance/Discount.vue'
// import Maintenance from './page/Maintenance/Maintenance.vue'
// import Goodslist from './page/Maintenance/Goodslist.vue'
// import Category from './page/Maintenance/Category.vue'
// import Logistics from './page/Maintenance/Logistics.vue'
//
// import Welcome from './page/Welcome.vue'
// import CheckCash from './page/Finance/CheckCash.vue'
// import CashLog from './page/Finance/CashLog.vue'

//异步组件 路由懒加载
const Frame = () => import('./frame/Frame.vue');
const Privilege = () => import('./privilege/Privilege.vue');
const Role = () => import('./privilege/Role.vue');
const User = () => import('./privilege/User.vue');
const Login = () => import('./personal/Login.vue');
const Personal = () => import('./personal/Personal.vue');
const MyAgents = () => import('./personal/MyAgents.vue');
const Userinfo = () => import('./page/Userinfo.vue');
const Chgpwd = () => import('./page/Chgpwd.vue');
const Discount = () => import('./page/Maintenance/Discount.vue');
const Maintenance = () => import('./page/Maintenance/Maintenance.vue');
const Goodslist = () => import('./page/Maintenance/Goodslist.vue');
const Category = () => import('./page/Maintenance/Category.vue');
const Logistics = () => import('./page/Maintenance/Logistics.vue');
const Welcome = () => import('./page/Welcome.vue');
const CheckCash = () => import('./page/Finance/CheckCash.vue');
const CashLog = resolve => require(['./page/Finance/CashLog.vue'], resolve);

Vue.use(VueRouter)

const routes = [
    {
        path: '/admin',
        component: Frame,
        children: [
            {
                path: 'privilege',
                component: Privilege,
                meta: {
                    requireAuth: true,
                    agent: 'pc'
                }
            },
            {
                path: 'role',
                component: Role,
                meta: {
                    requireAuth: true,
                    agent: 'pc'
                }
            },
            {
                path: 'user',
                component: User,
                meta: {
                    requireAuth: true,
                    agent: 'pc'
                }
            },
            {
                path: 'info',
                component: Userinfo,
                meta: {
                    requireAuth: true,
                    agent: 'pc'
                }
            },
            {
                path: 'chgpwd',
                component: Chgpwd,
                meta: {
                    requireAuth: true,
                    agent: 'pc'
                }
            },
            {
                path: 'myagents',
                component: MyAgents,
                meta: {
                    requireAuth: true,
                    agent: 'pc'
                }
            },
            {
                path: 'welcome',
                component: Welcome,
                meta: {
                    requireAuth: true,
                    agent: 'pc'
                }
            },
            {
                path: 'discount',
                component: Discount,
                meta: {
                    requireAuth: true,
                    agent: 'pc'
                }
            },
            {
                path: 'checkcash',
                component: CheckCash,
                meta: {
                    requireAuth: true,
                    agent: 'pc'
                }
            },
            {
                path: 'cashlog',
                component: CashLog,
                meta: {
                    requireAuth: true,
                    agent: 'pc'
                }
            },
            {
                path: 'maintenance',
                component: Maintenance,
                meta: {
                    requireAuth: true,
                    agent: 'pc'
                }
            },
            {
                path: 'category',
                component: Category,
                meta: {
                    requireAuth: true,
                    agent: 'pc'
                }
            },
            {
                path: 'logistics',
                component: Logistics,
                meta: {
                    requireAuth: true,
                    agent: 'pc'
                }
            },
            {
                path: 'goodslist',
                component: Goodslist,
                meta: {
                    requireAuth: true,
                    agent: 'pc'
                }
            },
        ]
    },
    {
        path: '/personal',
        component: Personal,
        children: [
            {
                path: 'login',
                component: Login,
                meta: {
                    requireAuth: false,
                    agent: 'pc'
                }
            },
        ]
    },
    {
        path: '*',
        redirect: '/admin/welcome'
    }
];

/*
 * 新建一个方法  当new Router时，实例就包含goBack方法
 * 可用this.$router.goBack()调用
 */
VueRouter.prototype.goBack = function () {
    this.isBack = true;
    this.go(-1);
}

const router = new VueRouter({
    scrollBehavior: () => ({ y: 0 }), // 滚动条滚动的行为，不加这个默认就会记忆原来滚动条的位置
    routes
});

router.beforeEach((to, from, next) => {
    store.dispatch('showLoading');
    if (to.matched.some(r => r.meta.requireAuth)) {
        if (store.state.token) {
            next();
        }
        else {
            next({
                path: '/personal/login',
                query: {redirect: to.fullPath}
            })
        }
    }
    else {
        next();
    }
});

router.afterEach(function (to) {
    store.dispatch('hideLoading')
});

export default router;


