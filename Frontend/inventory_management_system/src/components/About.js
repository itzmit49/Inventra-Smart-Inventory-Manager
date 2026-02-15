import React from "react";

export default function About() {
  return (
    <div className="container-fluid" style={{backgroundColor: '#F8FAFB'}}>

      {/* HEADER */}
      <div className="container text-center py-5">
        <h1 className="fw-bold mb-3">
          Inventory Management Platform
        </h1>

        <p className="lead text-muted">
          A modern full-stack MERN application built to simplify product
          tracking, streamline inventory workflows, and support scalable
          business operations.
        </p>
      </div>

      {/* VALUE SECTION */}
      <div className="container py-4">
        <div className="row g-4">

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5>📦 Intelligent Inventory Control</h5>
                <p>
                  Real-time stock management enables accurate tracking,
                  minimizing inventory errors while improving operational
                  efficiency.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5>⚡ High-Performance CRUD System</h5>
                <p>
                  Optimized backend APIs and a responsive React interface
                  ensure seamless data operations and smooth user experience.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5>🔒 Scalable Architecture</h5>
                <p>
                  Designed with scalability and maintainability in mind,
                  making it suitable for expanding inventory needs.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* TECHNOLOGY STACK */}
      <div className="container py-5">
        <h2 className="text-center mb-4">Technology Stack</h2>

        <div className="row text-center g-4">

          <div className="col-md-3 col-sm-6">
            <div className="bg-white shadow-sm p-4 rounded">
              <h5>MongoDB</h5>
              <p className="text-muted">
                Flexible NoSQL database for structured product storage.
              </p>
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
            <div className="bg-white shadow-sm p-4 rounded">
              <h5>Express.js</h5>
              <p className="text-muted">
                RESTful backend API handling and server logic.
              </p>
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
            <div className="bg-white shadow-sm p-4 rounded">
              <h5>React</h5>
              <p className="text-muted">
                Interactive frontend UI with component architecture.
              </p>
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
            <div className="bg-white shadow-sm p-4 rounded">
              <h5>Node.js</h5>
              <p className="text-muted">
                High-performance server runtime environment.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER MESSAGE */}
      <div className="container text-center py-4">
        <p className="text-muted">
          This project demonstrates full-stack engineering practices including
          API integration, responsive UI design, database management, and
          scalable CRUD workflows — reflecting real-world inventory solutions.
        </p>
      </div>

    </div>
  );
}
