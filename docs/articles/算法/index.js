var waysToChange = function (n) {
    const dp = [1].concat(new Array(n).fill(0));
    const coins = [25, 10, 5, 1];
    const mod = 1000000007;
    let coin;
    //四种硬币
    for (let i = 0; i < 4; i++) {
        coin = coins[i];
        //总面额为 n 分
        for (let j = coin; j <= n; j++) {
            //表示 
            dp[j] = (dp[j] + dp[j - coin] + 1) % mod
        }
    }
    return dp[n];
};
console.log(waysToChange(5))