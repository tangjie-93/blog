var checkSubarraySum = function (nums, k) {
    const dp = new Array(nums.length + 1).fill(0)
    let count = 0
    //判断是否有连续的两个0
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] === 0) {
            count++
        } else {
            count = 0
        }
        if (count >= 2) {
            return true
        }
    }
    for (let i = 0; i < nums.length; i++) {
        for (let j = 0; j <= i; j++) {
            //逐个相加除以6看是否整除
            dp[j] = (dp[j] + nums[i]) % k
            //i>j强调了数组大于2
            if (i > j && dp[j] === 0) {
                return true
            }
        }
    }
    return false
};
console.log(checkSubarraySum([6, 0], 6))