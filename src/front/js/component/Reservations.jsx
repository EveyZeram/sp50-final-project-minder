import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext.js" 

export const Reservations = () => {
  const { store, actions } = useContext(Context);

    return (
      <div className="container">
        <h3 className="m-3 text-center">Reservas:</h3>
        <p className="m-3 text-center">Total reservas: </p>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th># Reserva</th>
              <th>Medicamento</th> 
              <th>Farmacia</th> 
              <th>Tiempo de reserva</th> {/*tienes hasta <fecha> para recoger el medicamento*/}
              <th>Order Status</th> {/*Pendiente, Aceptada, Cancelada, Recogida*/}
              </tr>
          </thead>
          
          <tbody>
            <tr>
              <td>Reserva numer 1</td>
              <td>Medicamento A</td>
              <td>Famacia 1 A</td>
              <td>Tienes hasta [fecha] para recoger el medicamento</td>
              <td>Pendiente</td>
            </tr>
          </tbody>
        </Table>    
              
      </div>
    );
  };
