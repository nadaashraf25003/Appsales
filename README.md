# 🛒 Inventory Management System

                                                                                                                                      

An **Inventory Management System** built using **Angular 19** and **NgRx** to manage products efficiently. This project integrates with a **Spring Boot** backend and provides a fully functional CRUD (Create, Read, Update, Delete) interface for managing inventory.

---

## 🚀 Features

- 📋 **View Products**: List all products in the inventory.
- ➕ **Add Products**: Easily add new items to the inventory.
- ✏️ **Update Products**: Modify product details such as name, price, stock, and description.
- ❌ **Delete Products**: Remove unwanted products from the inventory.
- 🛠️ **State Management with NgRx**: Implements actions, reducers, selectors, and effects for seamless state handling.
- 🌐 **Backend Integration**: Communicates with a Spring Boot API for real-time data operations.

---

## 🛠️ Tech Stack

### Frontend
- **Angular 19**
- **NgRx** for state management
- **Bootstrap** for styling

### Backend
- **Spring Boot**
- **REST API**

---

## 📁 Project Structure

### Angular Folder Structure

```plaintext
src/
├── app/
│   ├── components/
│   │   ├── product/
│   │   │   ├── product.component.ts
│   │   │   ├── product.component.html
│   │   │   ├── product.component.css
│   ├── models/
│   │   ├── product.model.ts
│   ├── services/
│   │   ├── product.service.ts
│   ├── store/
│   │   ├── product.actions.ts
│   │   ├── product.reducer.ts
│   │   ├── product.selectors.ts
│   │   ├── product.effects.ts
│   ├── app.module.ts
│   ├── app.component.ts
│   ├── app.component.html

```

---

## 🏗️ Installation and Setup

Follow these steps to set up the project locally:

### Frontend

1. Clone the repository:

```bash

    git clone https://github.com/Mauro-Pereira/inventory-front-end.git
    cd inventory-front-end
```

2. Install dependencies:

```bash
    npm install
```

3. Start the Angular application:
 
 ```bash
    ng serve
```

4. Navigate to http://localhost:4200

### back-end

1. Set up Spring Boot project making clone here: https://github.com/Mauro-Pereira/inventory-back-end

2. Run the application:

```bash
    docker compose up
```

3. Backend will be available at http://localhost:8080.
 ```
   By Kareem Mohamed
