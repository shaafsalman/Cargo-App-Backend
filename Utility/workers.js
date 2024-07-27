// const { Worker } = require('worker_threads');


// export const sendNotifications = (data) => {
//     const workerPath = path.resolve(__dirname, '../Utility/sendNotificationWorker');
//     const worker = new Worker(workerPath);
//     worker.postMessage(data);
//     worker.on('message', (result) => {
//         if (!result.success) {
//             console.error('Error sending notification:', result.error);
//         }
//     });
// };

