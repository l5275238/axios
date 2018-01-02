/*********
 * 配置ajax相关配置
 * BASE_URL axios的baseurl路径
 */
class Api{
  constructor(){
    if(process.env.NODE_ENV==='development'){

      this.BASE_URL='/api';
      this.IMG_URL='/api';
      this.BEFORE_IMG='http://192.168.3.122';
      this.BASE_URL_TWO='/api/ikid_qudong'
      this.BASE_URL_Tree='/api/ikid_qudong'
      this.BASE_URL_four='/api/ikid_qudong'

    }else{
      this.BASE_URL='';
      this.IMG_URL='';
      this.BEFORE_IMG='';
      this.BASE_URL_TWO=''
      this.BASE_URL_Tree=''
      this.BASE_URL_four=''
    }
  }
}
const newApi=new Api()
export default newApi;
