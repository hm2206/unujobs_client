import React, { Component } from 'react';
import { authentication } from '../../services/apis';
import { Button, Form, Input } from 'semantic-ui-react';


export default class Remuneracion extends Component
{


    state = {
        remuneraciones: [],
        loader: true,
        total_bruto: 0,
        total_desct: 0,
        base: 0,
        total_neto: 0,
    }


    componentDidMount() {
        this.getRemuneraciones(this.props);
    }

    componentWillReceiveProps = async (nextProps) => {
        if (nextProps.historial && nextProps.historial.id != this.props.historial.id) {
            await this.getRemuneraciones(nextProps);
        }
    }

    getRemuneraciones = async (props) => {
        let { historial } = props;
        await authentication.get(`historial/${historial.id}/remuneracion`)
        .then(res => {
            let { remuneraciones, total_bruto, total_desct, total_neto, base } = res.data;
            this.setState({ 
                remuneraciones: remuneraciones ? remuneraciones : [],
                total_bruto,
                total_desct,
                total_neto,
                base
            });
        }).catch(err => console.log(err.message));
        this.setState({ loader: false });
    }


    render() {

        let { remuneraciones, total_bruto, total_desct, total_neto, base, loader } = this.state;
 
        return (
            <form className="row">

                <div className="col-md-12">
                    <div className="row justify-content-center">
                        <b className="col-md-3">
                            <Button basic loading={loader} fluid color="black">
                                {loader ? 'Cargando...' : `Total Descuentos: S/ ${total_bruto}`}
                            </Button>
                        </b>
                        <b className="col-md-3">
                            <Button basic loading={loader} fluid color="black">
                                {loader ? 'Cargando...' : `Total Bruto: S/ ${total_desct}`}
                            </Button>
                        </b>
                        <b className="col-md-3">
                            <Button basic loading={loader} fluid color="black">
                                {loader ? 'Cargando...' : `Base Imponible: S/ ${base}`}
                            </Button>
                        </b>
                        <b className="col-md-3">
                            <Button basic loading={loader} fluid color="black">
                                {loader ? 'Cargando...' : `Total Neto: S/ ${total_neto}`}
                            </Button>
                        </b>
                    </div>
                </div>
                
                <div className="col-md-12">
                    <hr/>
                </div>

                {remuneraciones.map(obj => 
                    <div  key={`remuneracion-${obj.id}`}
                         className="col-md-3 mb-1"
                    >
                        <span className="text-danger">
                            {obj.type_remuneracion && obj.type_remuneracion.key}
                        </span>
                            .-
                        <span className="text-primary">
                            {obj.type_remuneracion && obj.type_remuneracion.alias}
                        </span>
                        <Form.Field>
                            <input type="number"
                                step="any" 
                                value={obj.monto}
                                disabled={!obj.edit ? true : !this.props.edit}
                            />
                        </Form.Field>
                    </div>
                )}
            </form>
        )
    }

}