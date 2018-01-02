/**
 * Created by Administrator on 2017/5/22 0022.
 */
import config from './config'

// import axios from 'axios'
import axios from '../api/axios/index.js'
import api from '../api/api'
import * as CODE from './code.js'

class Service {
  constructor() {
    this.isWxRequest=false;
    this.loadList=0;
  }

  //出错
  error(res) {
    console.info(res);
    if(res){
      this.vm.alert(res.message)
    }

  }
  wxRequest(){
    this.isWxRequest=true;
    let url=window.location.href;
    this.common({
      url:"/frontNew/wxAccredit",
      baseURL:api.BASE_URL_TWO,
      data:{
        requestUrl:url,
      },
      success:(res)=>{

          window.location=res.accreditUrl;
      }
    })
  }

  //ajax调用前
  before() {

    this.loadList++;
    this.vm.$vux.loading.show({
      text: '加载中',
      position:"fixed",
    })
  }

  //ajax调用后
  after() {

  }

  //通用异常返回code不为10000的时候做通用处理也可以在参数里自定义
  abnormal(res) {

    this.vm.alert( res.message || res.msg)
  }

  //token超时重新登录
  loginAgain() {

    this.vm.$router.push({
      'name': 'login',
      query: {form: this.vm.$router.currentRoute.fullPath}
    })
  }

  /*
   * 对象合并把用户参数和基本配置合并
   * */
  configure(param) {

    return Object.assign({}, config, param)
  }
  loadHid(){
    this.loadList--;
    if(this.loadList==0){
      this.vm.$vux.loading.hide();

    }

  }

  //通用api
  async common(param) {
    let result = true;
    let _config = this.configure(param);
    await this.before();//等待请求前的操作完成
    let res
    try {

      res = await axios(param.url, _config);

    } catch (e) {
        this.loadHid();

      res = e;
      param.error ? param.error(res) : this.error(res);

      return false
    }

    this.loadHid();

    if(typeof res.data.status!=='number'&&res.data.data){
      res.data.status=0
    }
    res.data.status = res.data.status * 1//不管是字符串还是数字统一转成数字
    if (res.data.status === CODE.API_SUCCESS_CODE) {//状态为成功的时候
        if (res.data.data||JSON.stringify(res.data.body) != "{}") {
          param.success(res.data.data||res.data.body);
        } else {//没有返回参数，操作成功直接打印信息

          this.vm.alert(
            res.data.message|| res.data.msg)
          param.success(res.data.data);
        }

    }
    else {//异常处理，需要特殊处理的时候再参数里面加入异常函数
      if (res.data.status == CODE.API_LOGIN_OUT || res.data.status == 100) {

        if(this.vm.$store.state.isWeixin&&!this.isWxRequest){
            this.wxRequest();
            return
        }
        else {
          this.vm.alert(res.data.msg||res.data.message);
          setTimeout(() => {
            this.loginAgain();
          }, 1600)
          return
        }




      }
      if (param.abnormal) {//如果配置了异常处理走配置，没有配置走通用异常
        param.abnormal(res.data);
      } else {
        this.abnormal(res.data)
      }
      result = false
    }
    await this.after();
    return new Promise((r)=>{
      r(result)
    })
  };

  //ajax嵌套，像父ajax返回的结果子ajax拿来继续发ajax这类的调用这个
  async nesting(params) {
    await this.common(params)
    let obj = params.child;
    while (true) {
      if (obj) {
        await this.common(obj);
        obj = obj.child;
      } else {
        return;
      }
    }

  }

  all(params) {
    let arr = [];
    let _this = this;
    params.map(function (item, index) {
      arr[index] = _this.common(item);
    });
    return axios.all(arr)
      .then(axios.spread(function (acct, perms) {
        // Both requests are now complete
      }));
  }

  init(vue) {

    this.vm = vue;
    if (!Service.isinIt) {//相当于静态属性当属性被调用过就不再初始化axios
      // http request 拦截器
      axios.interceptors.request.use(
        config => {
          // if (this.vm.$store.state.loginInfo.token && config.authorization) {  // 判断是否存在token，如果存在的话，则每个http header都加上token
          //   config.headers['X-ZX-TOKEN'] = `${this.vm.$store.state.loginInfo.token}`;
          // }
          return config;
        },
        err => {
          return Promise.reject(err);
        });

// http response 拦截器
      axios.interceptors.response.use(

        response => {
          return response;
        },
        error => {
          console.log(error);
          if (error.response) {
            switch (error.response.status) {
              case 401:
                // 返回 401 清除token信息并跳转到登录页面
                // this.vm.commit(types.LOGOUT);

                this.vm.$router.replace({
                  path: 'login',
                  query: {form: this.vm.$router.currentRoute.fullPath}
                })
              case  502:
                this.vm.alert('网络不给力')
              case 504:
                this.vm.alert('网络不给力')
            }
            return Promise.reject(error.response.data)
          }
          return Promise.reject(error) // 返回接口返回的错误信息
        });
      Service.isinIt = true;
    }
  }

}

Service.isinIt = false;
export default Service
