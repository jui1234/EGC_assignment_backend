# EGC Assignment Backend

## Setup

```bash
git clone https://github.com/jui1234/EGC_assignment_backend.git
cd EGC_assignment_backend
npm install
```

Create a `.env` file in the project root:

```env
MONGO_URI='mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority'
```

## Run

```bash
npm run start
```

Server runs on http://localhost:5000

## API Base

- Base path: `/api/transactions`

Examples:

- POST `/api/transactions` – create
- GET `/api/transactions` – list
- GET `/api/transactions/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` – monthly summary
- PUT `/api/transactions/:id` – update
- DELETE `/api/transactions/:id` – delete


