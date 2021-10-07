const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  // return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
  return `${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const getNumLen = (str, num) => {
  return str.split(num).length - 1
}

const getRewardResult = numberStr => {
  let result = {
    class: null,
    name: null
  }
  const len1 = getNumLen(numberStr, '1')
  const len2 = getNumLen(numberStr, '2')
  const len3 = getNumLen(numberStr, '3')
  const len4 = getNumLen(numberStr, '4')
  const len5 = getNumLen(numberStr, '5')
  const len6 = getNumLen(numberStr, '6')
  if (len4 == 4 && len1 == 2)
    return result = {
      class: "状元",
      name: "插金花"
    }
  if (len4 == 6)
    return result = {
      class: "状元",
      name: "红六勃"
    }
  if (len1 == 6)
    return result = {
      class: "状元",
      name: "遍地锦"
    }
  if (len2 == 6 || len3 == 6 || len5 == 6 || len6 == 6)
    return result = {
      class: "状元",
      name: "黑六勃"
    }
  if (len4 == 5)
    return result = {
      class: "状元",
      name: "五红"
    }
  if (len1 == 5 || len2 == 5 || len3 == 5 || len5 == 5 || len6 == 5)
    return result = {
      class: "状元",
      name: "五子登科"
    }
  if (len4 == 4 && len1 == 0)
    return result = {
      class: "状元",
      name: "四红"
    }
  if (len1 == 1 && len2 == 1 && len3 == 1 && len4 == 1 && len5 == 1 && len6 == 1)
    return result = {
      class: "榜眼",
      name: "对堂"
    }
  if (len4 == 3)
    return result = {
      class: "探花",
      name: "三红"
    }
  if (len1 == 4 || len2 == 4 || len3 == 4 || len5 == 4 || len6 == 4)
    return result = {
      class: "进士",
      name: "四进"
    }
  if (len4 == 4)
    return result = {
      class: "举人",
      name: "二举"
    }
  if (len4 == 1)
    return result = {
      class: "秀才",
      name: "一秀"
    }
  return result  
}

module.exports = {
  formatTime,
  getRewardResult
}