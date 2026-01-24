graph TD
    A[Client Request] --> B(Docs Agent);
    B --> C(Architecture Agent);
    C --> D{Backlog and Design};
    D --> E[Code Agent];
    E --> F(Delivery Handoff);
    style A fill:#f9f,stroke:#333;
    style C fill:#ccf,stroke:#333,stroke-width:2px;
    classDef main fill:#f96,stroke:#333;
    class A,B,C,D,E,F main;