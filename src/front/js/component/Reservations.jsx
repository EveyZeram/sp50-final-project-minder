import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext.js" 
import { Table, Button, Badge, Pagination } from 'react-bootstrap';  // Pagination to be implemented later!

export const Reservations = () => {
  const { store, actions } = useContext(Context);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    actions.getPharmacyOrders();
    }, [actions.getPharmacyOrders]);

    const getStatusBadge = (status) => {
      switch (status) {
        case 'Pendiente':
          return <Badge pill bg="warning" text="dark" className="p-2">Pendiente</Badge>;
        case 'Aceptada':
          return <Badge pill bg="success" className="p-2">Aceptada</Badge>;
        case 'Cancelada':
          return <Badge pill bg="danger" className="p-2">Cancelada</Badge>;
        case 'Recogida':
          return <Badge pill bg="info" className="p-2">Recogida</Badge>;
        default:
          return <Badge pill bg="secondary" className="p-2">Desconocido</Badge>;
      }
    };

    const handleFilterClick = (status) => {
      setFilter(status);
    };

    const filteredOrders = store.ordersToPharmacy.filter((order) => {
      return filter === '' || order.order_status === filter;
    });



    return (
      <div className="container">
        <h3 className="m-3 text-center">Total reservas:{store.ordersToPharmacy.length}</h3>
        <div className="d-flex justify-content-center mb-3">
        <Badge pill bg="warning" text="dark" className="mx-2 p-2" onClick={() => handleFilterClick('Pendiente')} style={{ cursor: 'pointer' }}>Pendiente</Badge>
        <Badge pill bg="success" className="mx-2 p-2" onClick={() => handleFilterClick('Aceptada')} style={{ cursor: 'pointer' }}>Aceptada</Badge>
        <Badge pill bg="danger" className="mx-2 p-2" onClick={() => handleFilterClick('Cancelada')} style={{ cursor: 'pointer' }}>Cancelada</Badge>
        <Badge pill bg="info" className="mx-2 p-2" onClick={() => handleFilterClick('Recogida')} style={{ cursor: 'pointer' }}>Recogida</Badge>
        <Badge pill bg="secondary" className="mx-2 p-2" onClick={() => setFilter('')} style={{ cursor: 'pointer' }}>Mostrar Todo</Badge>
      </div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th># Reserva</th>
              <th>Medicamento</th> 
              <th>Usuario</th> 
              <th>Tiempo de reserva</th> {/*tienes hasta <fecha> para recoger el medicamento*/}
              <th>Order Status</th> {/*Pendiente, Aceptada, Cancelada, Recogida*/}
              <th>Acción</th> 
              </tr>
          </thead>
          
          <tbody>
          {filteredOrders.map((reservation, index) => (
            <tr key={index}>
              <td>Reserva número {reservation.id}</td>
              <td>{reservation.medicine ? reservation.medicine.medicine_name : 'N/A'}</td>
              <td>{reservation.pharmacy ? reservation.patient.name : 'N/A'}</td>
              <td>Tiene 24h para recoger el medicamento</td>
              <td>{getStatusBadge(reservation.order_status)}</td>
              <td><Button variant="outline-success" className="rounded-pill me-2">Aceptar</Button>
              <Button  variant="outline-danger"  className="rounded-pill">Cancelar</Button></td>
            </tr>
          ))}
          </tbody>
        </Table>    
              
      </div>
    );
  };
