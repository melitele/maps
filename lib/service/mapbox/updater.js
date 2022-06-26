module.exports = updater;

function updater() {
  let tasks = {};

  function destroy() {
    Object.values(tasks).forEach((task) => clearTimeout(task));
    tasks = undefined;
  }

  function reschedule(id, task, data, update, timeout) {
    if (tasks[id]) {
      clearTimeout(tasks[id]);
    }
    if (update(data)) {
      delete tasks[id];
      task(data);
      return;
    }
    tasks[id] = setTimeout(() => {
      delete tasks[id];
      task(data);
    }, timeout);
  }

  return {
    reschedule,
    destroy
  };
}
