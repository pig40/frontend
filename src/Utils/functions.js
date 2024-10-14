//判断是否为数字
let isNum = (value)=>{
    let reg = new RegExp('^[0-9]*$');
    let flag = reg.test(value);
    return flag;
}
function scientificMethed(num){
    // let reg = new RegExp('^[0-9]*$');
    let mark = isNum(num)
    let diff
    if(mark){
        diff = num.toString();
    }else{
        diff = num;
    }
    const diffLen = diff.length
    const floatDiff = diff / Math.pow(10,diffLen - 1)
    //保留三位小数
    const lastDiff = Math.round(floatDiff*Math.pow(10,2))/Math.pow(10,2)
    let lastDiffValue = lastDiff + "e+" + (diffLen - 1)
    return lastDiffValue;
}

export default scientificMethed;