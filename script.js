// const base_url = "http://localhost:5000/";
const base_url = "https://fancy-todo-ferd.herokuapp.com/";

function onSignIn(googleUser) {
  let profile = googleUser.getBasicProfile();
  let id_token = googleUser.getAuthResponse().id_token;
  console.log(id_token);
  $.ajax({
    url: base_url+"user/googlelogin",
    method: "POST",
    data: {
      googleToken: id_token
    }
  })
  .done(res => {
    console.log(res);
    localStorage.setItem("access_token", res.access_token);
    auth()
  })
  .fail(err => {
    console.log(err)
  } )
}

function auth() {
  if (!localStorage.getItem("access_token")) {
    $("#navbar-logout").show();
    $("#navbar-login").hide();
    $("#loginContainer").show();
    $("#registerContainer").hide();
    $("#kanban").hide();
  } else {
    getTodos();
    $("#navbar-logout").hide();
    $("#navbar-login").show();
    $("#loginContainer").hide();
    $("#registerContainer").hide();
    $("#kanban").show();
  }
}

function getRegisterPage() {
  $("#navbar-logout").show();
  $("#navbar-login").hide();
  $("#loginContainer").hide();
  $("#registerContainer").show();
  $("#kanban").hide();
}

function postLogin() {
  const email = $("#emailLogin").val();
  const password = $("#passwordLogin").val();
  console.log(email, password);
  $.ajax({
    url: base_url+"user/login",
    method: "POST",
    data: {
      email,
      password,
    },
  })
    .done((response) => {
      console.log(response);
      localStorage.setItem("access_token", response.access_token);
      auth();
    })
    .fail((xhr, test) => {
      swal({
        title: "Error!",
        text: xhr.responseJSON.message,
        icon: "error",
      })
      // console.log(text, 'ini isi text')
    })
    .always((_) => {
      console.log("always");
      $("#loginEmail").val("");
      $("#loginPassowrd").val("");
      // atauuu
      // $("#login-form").trigger("reset");
    });
}

function postRegister() {
  const email = $("#emailRegister").val();
  const password = $("#passwordRegister").val();
  console.log(email, password);
  $.ajax({
    url: base_url + "user/register",
    method: "POST",
    data: {
      email,
      password,
    },
  })
    .done((response) => {
      console.log(response);
      localStorage.setItem("access_token", response.access_token);
      auth();
    })
    .fail((xhr, text) => {
      console.log(xhr.responseJSON, 'ini respon nyaa bbroo')
      swal({
        title: "Error!",
        text: xhr.responseJSON.errors.join(', '),
        icon: "error",
      })
    })
    .always((_) => {
      console.log("always");
      $("#loginEmail").val("");
      $("#loginPassowrd").val("");
      // atauuu
      // $("#login-form").trigger("reset");
    });
}

function postTodo() {
  const title = $("#newTodoTitle").val();
  const description = $("#newTodoDesc").val();
  const status = $("#newTodoStatus").val();
  const due_date = $("#newTodoDueDate").val();
  $.ajax({
    url: base_url + "todos/",
    method: "POST",
    data: {
      title,
      description,
      status,
      due_date
    },
    headers: {
      access_token: localStorage.getItem("access_token"),
    },
  })
    .done((response) => {
      console.log(response);
      getTodos();
    })
    .fail((xhr, text) => {
      console.log(xhr, 'ini error nya broo');
      if(xhr.responseJSON.errors) {
        swal({
          title: "Error!",
          text: xhr.responseJSON.errors.join(', '),
          icon: "error",
        })
        console.log(xhr, text);
      } else {
        swal({
          title: "Error!",
          text: xhr.responseJSON.message,
          icon: "error",
        })
      }
        
    })
    .always((_) => {
      console.log("always from new todo form");
      $("#newTodo-form").trigger("reset");
      $("#newTodoTitle").val("");
      $("#newTodoDesc").val("");
      $("#newTodoStatus").val("todo");
      $("#newTodoDueDate").val(`${formatDate(new Date())}`);
  })
}

function formatDate (date){
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  if (month < 10) {
    month =`0${month}`;
  }
  if (day< 10) {
    day = `0${day}`;
  }
  let datestring= `${year}-${month}-${day}`
  console.log(datestring);
  return datestring
}

function getTodos() {
  $.ajax({
    url: base_url + "todos",
    method: "GET",
    headers: {
      access_token: localStorage.getItem("access_token"),
    },
  })  
    .done((todos) => {
      console.log(todos);
      $("#todo-list").empty();
      $("#doing-list").empty();
      $("#done-list").empty();
      
      todos.forEach((value) => {
        console.log(value);
        console.log(value.due_date.split('T')[0])
        let { id, title, description, due_date, status } = value;
        if (status === "todo") {
          $("#todo-list").append(`
            <!--start per task / mau loop-->
            <div class="card mb-3 bg-light shadow-sm" id="todo${value.id}">
              <div class="card-body p-3">
                      
                <h5 id="title${value.id}"><!--taskname-->${value.title}</h5>
                <p id="description${value.id}"><!--task desc-->${value.description}</p>

                <form  class="form-inline row g-3 justify-content-end" id="todo${value.id}" action="#" method="post">
                <div class="col-sm-1">
                  <input type="text" readonly class="form-control form-control-sm mb-2" id="status${value.id}" value="${value.status}">
                </div>

                <div class="col-sm-2">
                  <input type="date" readonly class="form-control form-control-sm mb-2" id="due_date${value.id}" value="${value.due_date.split('T')[0]}" placeholder="Due Date">
                </div>

                <div class="col-auto">
                  <a onclick="getEditTodo(${id},'${title}','${description}','${due_date}','${status}')" id="edit-task-${value.id}" class="btn btn-outline-primary btn-sm"> 
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                      <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                    </svg>
                  </a>
                </div>

                <div class="col-auto">
                  <a onclick="deleteTodo(${value.id})" id="del-task-${value.id}" class="btn btn-outline-danger btn-sm"> 
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                          <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                      </svg>
                  </a>
                </div>

                </form>

              </div>
            </div>
          `);
        } else if (status == "doing") {
          $("#doing-list").append(`
            <!--start per task / mau loop-->
            <div class="card mb-3 bg-light shadow-sm" id="todo${value.id}">
              <div class="card-body p-3">
                      
                <h5 id="title${value.id}"><!--taskname-->${value.title}</h5>
                <p id="description${value.id}"><!--task desc-->${value.description}</p>

                <form  class="form-inline row g-3 justify-content-end" id="todo${value.id}" action="#" method="post">
                <div class="col-sm-1">
                  <input type="text" readonly class="form-control form-control-sm mb-2" id="status${value.id}" value="${value.status}">
                </div>

                <div class="col-sm-2">
                  <input type="date" readonly class="form-control form-control-sm mb-2" id="due_date${value.id}" value="${value.due_date.split('T')[0]}" placeholder="Due Date">
                </div>

                <div class="col-auto">
                  <a onclick="getEditTodo(${id},'${title}','${description}','${due_date}','${status}')" id="edit-task-${value.id}" class="btn btn-outline-primary btn-sm"> 
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                      <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                    </svg>
                  </a>
                </div>

                <div class="col-auto">
                  <a onclick="deleteTodo(${value.id})" id="del-task-${value.id}" class="btn btn-outline-danger btn-sm"> 
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                          <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                      </svg>
                  </a>
                </div>

                </form>

              </div>
            </div>
          `);
        } else if (status == "done") {
          $("#done-list").append(`
            <!--start per task / mau loop-->
            <div class="card mb-3 bg-light shadow-sm" id="todo${value.id}">
              <div class="card-body p-3">
                      
                <h5 id="title${value.id}"><!--taskname-->${value.title}</h5>
                <p id="description${value.id}"><!--task desc-->${value.description}</p>

                <form  class="form-inline row g-3 justify-content-end" id="todo${value.id}" action="#" method="post">
                <div class="col-sm-1">
                  <input type="text" readonly class="form-control form-control-sm mb-2" id="status${value.id}" value="${value.status}">
                </div>

                <div class="col-sm-2">
                  <input type="date" readonly class="form-control form-control-sm mb-2" id="due_date${value.id}" value="${value.due_date.split('T')[0]}" placeholder="Due Date">
                </div>

                <div class="col-auto">
                  <a onclick="getEditTodo(${id},'${title}','${description}','${due_date}','${status}')" id="edit-task-${value.id}" class="btn btn-outline-primary btn-sm"> 
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                      <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                    </svg>
                  </a>
                </div>

                <div class="col-auto">
                  <a onclick="deleteTodo(${value.id})" id="del-task-${value.id}" class="btn btn-outline-danger btn-sm"> 
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                          <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                      </svg>
                  </a>
                </div>

                </form>

              </div>
            </div>
          `);
        }
      });
    })
    .fail((xhr, text) => {
      console.log(xhr, text)
    })
    .always((_) => {
      $("#newTodoDueDate").val(`${formatDate(new Date())}`);
      console.log('always getTodos')
    })
}

function getEditTodo(id, title, description, due_date, status) {
  let option;
  if (status == 'todo') {
    option = `
      <option selected value="todo">Todo</option>
      <option value="doing">Doing</option>
      <option value="done">Done</option>`
  } else if (status == 'doing') {
    option = `
      <option value="todo">Todo</option>
      <option selected value="doing">Doing</option>
      <option value="done">Done</option>`
  } else if (status == 'done') {
    option = `
      <option value="todo">Todo</option>
      <option value="doing">Doing</option>
      <option selected value="done">Done</option>`
  }
  $(`#todo${id}`).empty();
  $(`#todo${id}`).append(`
  <form  class="card-body p-3 form-inline row g-3 justify-content-center" id="editTodo">
  <div class="col-md-2">
    <input type="text" value="${title}" class="form-control mb-2" id="editTodoTitle${id}" placeholder="Edit Todo Title">
  </div>
  <div class="col-md-4">
    <input type="text" value="${description}" class="form-control mb-2" id="editTodoDesc${id}" placeholder="Description">
  </div>
  <div class="col-auto">
    <!-- <label class="sr-only" for="editTodoStatus">Preference</label> -->
    <select class="form-select mb-2" id="editTodoStatus${id}">
      ${option}
    </select>
  </div>
  <div class="col-md-3">
    <!-- <label class="sr-only" for="editTodoDate">Due Date</label> -->
    <input type="date" value="${due_date.split('T')[0]}" class="form-control mb-2" id="editTodoDueDate${id}" placeholder="Due Date">
  </div>

  <div class="col-sm-2">
    <a onclick="putTodo(${id})"
    id="editTodoButton" 
    class="btn btn-outline-primary btn-md form-control mb-2">Edit</a>
  </div>
  <div class="col-sm-2">
    <a onclick="getTodos()"
    id="cancelEditTodoButton" 
    class="btn btn-outline-danger btn-md form-control mb-2">Cancel</a>
  </div>
</form>
  `)
  .fail((xhr, text) => {
    console.log(xhr, text)
  })
  .always((_) => {
    console.log('always getEdit')
  })
}

function putTodo(id) {
  let title = $(`#editTodoTitle${id}`).val();
  let description  = $(`#editTodoDesc${id}`).val();
  let status = $(`#editTodoStatus${id}`).val();
  let due_date = $(`#editTodoDueDate${id}`).val();
  $.ajax({
    url: base_url + "todos/" + id,
    method: "put",
    headers: {
      access_token: localStorage.getItem("access_token"),
    },
    data: {
      title, description, status, due_date
    }
  })
  .done((_) => {
    getTodos();
  })
  .fail((xhr, text) => {
    swal({
      title: "Error!",
      text: xhr.responseJSON.errors.join(', '),
      icon: "error",
    })
    console.log(xhr, text);
  })
}

function deleteTodo(id) {
  $.ajax({
    url: base_url + "todos/" + id,
    method: "delete",
    headers: {
      access_token: localStorage.getItem("access_token"),
    },
  })
  .done((_) => {
    getTodos();
  })
  .fail((xhr, text) => {
    console.log(xhr, text)
  })
}

function logout() {
  localStorage.clear();
  var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
  auth();
}

$(document).ready(() => {
  auth();
  $("#login-form").on("submit", (e) => {
    e.preventDefault();
    postLogin();
  });

  
  $("#gotoregister").on("click", (e) => {
    e.preventDefault();
    getRegisterPage();
  })

  $("#register-form").on("submit", (e) => {
    e.preventDefault();
    postRegister();
  });

  $("#newTodo-form").on("submit", (e) => {
    e.preventDefault();
    postTodo();
  });
  
  $("#navbar-register-button").on("click", (e) => {
    e.preventDefault();
    getRegisterPage();
  })
  
  $("#navbar-login-button").on("click", (e) => {
    e.preventDefault();
    auth();
  })
  
  $("#navbar-logout-button").on("click", (e) => {
    e.preventDefault();
    logout();
  });
  

});

