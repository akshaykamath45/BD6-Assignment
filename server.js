let { app } = require("./index");
let port = 3000;
app.listen(port, () => {
  console.log(`Server is listening at port ${port}`);
});
