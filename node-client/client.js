const os = require('os');

const averageCpusTime = () => {
    const cpus = os.cpus();
    const logicalCores = cpus.length;

    const aggregatedTime = cpus
        .map(cpu => cpu.times)
        .reduce((aggCpu, time) => {
            aggCpu.totalTime += Object.values(time).reduce((a, b) => a + b, 0);
            aggCpu.idle += time.idle;
            return aggCpu;
        }, { totalTime: 0, idle: 0 });

    return {
        totalTime: aggregatedTime.totalTime / logicalCores,
        idle: aggregatedTime.idle / logicalCores,
    };
};

const load = (timeRange) => new Promise((resolve, reject) => {
    const startAverageCpusTime = averageCpusTime();
    setTimeout(() => {
        const endAverageCpusTime = averageCpusTime();
        const idleDifference = endAverageCpusTime.idle - startAverageCpusTime.idle;
        const totalDifference = endAverageCpusTime.totalTime - startAverageCpusTime.totalTime;

        const percentageUsed = 100 - Math.floor(100 * idleDifference / totalDifference);
        resolve(percentageUsed);
    }, timeRange)
});

const getPerformanceData = async (timeRange) => {
    const cpus = os.cpus();
    const cpuLoadPercentage = await load(timeRange);

    const displayableOsType = os.type() === 'Darwin' ? 'Mac' : os.type();
    const upTime = os.uptime();
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();
    const usedMemory = totalMemory - freeMemory;

    return {
        osType: displayableOsType,
        upTime: upTime,
        freeMemory: freeMemory,
        totalMemory: totalMemory,
        usedMemory: totalMemory - freeMemory,
        memoryUsagePercentage: (usedMemory / totalMemory) * 100,
        model: cpus[0].model,
        speed: cpus[0].speed,
        logicalCores: cpus.length,
        cpuLoadPercentage: cpuLoadPercentage
    }
}


setInterval(async () => {
    const l = await getPerformanceData(100)
    console.log(l)
}, 100)
