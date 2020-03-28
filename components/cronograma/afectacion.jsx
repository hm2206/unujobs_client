import React, {Component} from 'react';
import { unujobs } from '../../services/apis';
import { Form, Select, Message, Input, TextArea, Button } from 'semantic-ui-react';
import Show from '../show';
import ConsultaIframe from '../consultaIframe';
import { parseOptions } from '../../services/utils';
import storage from '../../services/storage.json';
import Swal from 'sweetalert2';

export default class Afectacion extends Component {


    state = {
        history: {},
        work: {},
        afps: [],
        info: {},
        type_afps: [],
        metas: [],
        cargos: [],
        type_categorias: [],
        dependencias: [],
        errors: {},
        error_message: "",
        ssp: 'none',
        essalud: 'none'
    };


    async componentDidMount() {
        await this.setting(this.props, this.state);
        await this.getAFPs();
        this.getMetas();
        this.getTypeCategorias(this.state);
        this.getDependencias();
    }

    async componentWillReceiveProps(nextProps) {
        if (!nextProps.loading && nextProps.historial != this.props.historial) {
            await this.setting(nextProps);
        }
        // update send
        if (nextProps.send && nextProps.send != this.props.send) {
            await this.updatedHistorial();
        }
    }

    setting = async (nextProps) => {
        this.setState({
            history: nextProps.historial ? nextProps.historial : {},
            work: nextProps.historial.work ? nextProps.historial.work : {},
            info: nextProps.historial.info ? nextProps.historial.info : {},
        });
    }

    getDependencias = async () => {
        await unujobs.get('dependencia')
        .then(res => this.setState({ dependencias: res.data }))
        .catch(err => console.log(err.message));
    }

    getAFPs = async () => {
        await unujobs.get(`afp`).then(res => this.setState({
            afps: res.data ? res.data : []
        })).catch(err => console.log(err.message));
    }

    handleInput = (e) => {
        let {name, value} = e.target;
        let newObject = Object.assign({}, this.state.history);
        newObject[name] = value;
        this.setState({history: newObject});
    }

    handleSelect = async (e, { name, value }) => {
        let newObject = Object.assign({}, this.state.history);
        newObject[name] = value;
        if (name == 'afp_id') newObject['type_afp_id'] = "";
        this.setState({ history: newObject });
    }

    getMetas = () => {
        let {history} = this.state;
        unujobs.get(`cronograma/${history.cronograma_id}/meta`)
        .then(res => this.setState({metas: res.data}))
        .catch(err => console.log(err.message));
    }

    getTypeCategorias = (state) => {
        let {history} = state;
        unujobs.get(`type_categoria/${history.type_categoria_id}`)
        .then(res => {
            this.setState({ cargos: res.data.cargos ? res.data.cargos : [] });
        }).catch(err => console.log(err.message));
    }

    updatedHistorial = async () => {
        this.setState({ errors: {}, error_message: "" });
        let { history } = this.state;
        let form = new FormData(document.getElementById('form-afectacion'));
        form.append('afp_id', history.afp_id);
        form.append('type_afp_id', history.type_afp_id);
        form.append('meta_id', history.meta_id);
        form.append('dependencia_id', history.dependencia_id);
        form.append('cargo_id', history.cargo_id);
        form.append('type_categoria_id', history.type_categoria_id);
        form.append('_method', 'PUT');
        await unujobs.post(`historial/${this.state.history.id}`, form)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            Swal.fire({ icon, text: message });
            success ? await this.props.updatedHistorial(this.state.history) : null;
        })
        .catch(err => {
            try {
                let { data } = err.response
                this.setState({ 
                    errors: data.errors,
                    error_message: data.message
                });
            } catch (error) {
                Swal.fire({ icon: 'error', text: "algo salió mal" });
            }
        });
        this.props.fireSent();
    }

    render() {

        let {
            history,
            cargos,
            info,
            dependencias,
            afps,
            type_afps,
            metas,
            errors,
            error_message
        } = this.state;

        return (
            <Form className="row" id="form-afectacion">
                <Show condicion={error_message}>
                    <div className="col-md-12 mb-4">
                        <Message color="red">
                            Error: {error_message}
                        </Message>
                    </div>
                </Show>

                <Show condicion={this.props.edit}>
                    <div className="col-md-12">
                        <Button color="teal" basic
                            onClick={(e) => this.setState({ ssp: 'flex' })}
                        >
                            Consulta SSP
                        </Button>

                        <Button color="teal" basic
                            onClick={(e) => this.setState({ essalud: 'flex' })}
                        >
                            Consulta Essalud
                        </Button>

                        <hr/>
                    </div>
                </Show>

                <div className="col-md-3">
                    <Form.Field>
                        <b>Ley Social <b className="text-red">*</b></b>
                        <Show condicion={this.props.edit}>
                            <Select
                                options={parseOptions(afps, ['sel-afp', '', 'Select. AFP'], ['id', 'id', 'descripcion'])}
                                placeholder="Select. AFP"
                                value={history.afp_id}
                                name="afp_id"
                                onChange={this.handleSelect}
                                error={errors.afp_id && errors.afp_id[0]}
                            />
                        </Show>
                        <Show condicion={!this.props.edit}>
                            <input type="text"
                                disabled={true}
                                defaultValue={history.afp ? `${history.afp.afp} - ${history.afp.type_afp}` : ''}
                            />
                        </Show>
                    </Form.Field>

                    <Form.Field>
                        <b>Fecha de Ingreso</b>
                        <input type="date" 
                            name="fecha_de_ingreso"
                            defaultValue={info.fecha_de_ingreso}
                            onChange={this.handleInput}
                            disabled={true}
                        />
                    </Form.Field>

                    <Form.Field>
                        <b>Meta <b className="text-red">*</b></b>
                        <Show condicion={this.props.edit}>
                            <Select
                                options={parseOptions(metas, ['sel-meta', '', 'Select. Meta'], ['id', 'id', 'metaID'])}
                                placeholder="Select. Meta"
                                value={history.meta_id}
                                name="meta_id"
                                onChange={this.handleSelect}
                                error={errors.meta_id && errors.meta_id[0]}
                            />
                        </Show>
                        <Show condicion={!this.props.edit}>
                            <input type="text" name="meta_id"
                                disabled={true}
                                value={`${history.meta ? history.meta.metaID : ''}.-${history.meta ? history.meta.meta : ''}`}
                            />
                        </Show>
                    </Form.Field>
                    
                    <Form.Field>
                        <b>Planilla</b>
                        <input type="text"
                            defaultValue={history.planilla && history.planilla.nombre}
                            disabled={true}
                        />
                    </Form.Field>

                    <Form.Field>
                        <b>Tip. Cuenta</b>
                        <input type="text"
                            defaultValue="B NACIÓN"
                            disabled={true}
                        />
                    </Form.Field>

                </div>

                <div className="col-md-3">
                    <Form.Field>
                        <b>N° CUSSP</b>
                        <input type="text" 
                            name="numero_de_cussp"  
                            min="8"
                            value={history.numero_de_cussp ? history.numero_de_cussp : ''}
                            onChange={this.handleInput}
                            disabled={!this.props.edit}
                        />
                    </Form.Field>

                    <Form.Field>
                        <b>Fecha de Cese</b>
                        <input type="date" 
                            name="fecha_de_cese"
                            defaultValue={info.fecha_de_cese ? info.fecha_de_cese : ''}
                            onChange={this.handleInput}
                            disabled={true}
                        />
                    </Form.Field>

                    <Form.Field>
                        <b>Cargo <b className="text-red">*</b></b>
                        <Show condicion={this.props.edit}>
                            <Select
                                options={parseOptions(cargos, ['sel-cargo', '', 'Select. Cargo'], ['id', 'id', 'descripcion'])}
                                placeholder="Select. Cargo"
                                value={history.cargo_id}
                                name="cargo_id"
                                onChange={this.handleSelect}
                                error={errors.cargo_id && errors.cargo_id[0]}
                            />
                        </Show>
                        <Show condicion={!this.props.edit}>
                            <input type="text" 
                                defaultValue={history.cargo && history.cargo.descripcion}
                                disabled={true}
                            />
                        </Show>
                    </Form.Field>

                    <Form.Field>
                        <b>Dependencia/Oficina</b>
                        <Show condicion={this.props.edit}>
                            <Select
                                options={parseOptions(dependencias, ['sel_dep', '', 'Select. Dependencia/Oficina'], ['id', 'id', 'nombre'])}
                                placeholder="Select. Dependencia/Oficina"
                                value={history.dependencia_id}
                                name="dependencia_id"
                                onChange={this.handleSelect}
                                error={errors.dependencia_id && errors.dependencia_id[0]}
                            />
                        </Show>
                        <Show condicion={!this.props.edit}>
                            <input type="text"
                                disabled={true}
                                defaultValue={history.dependencia && history.dependencia.nombre}
                            />
                        </Show>
                    </Form.Field>

                    <Form.Field>
                        <b>N° Cuenta</b>
                        <input type="text"
                            defaultValue={history.numero_de_cuenta ? history.numero_de_cuenta : ''}
                            disabled={!this.props.edit}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-3">
                    <Form.Field>
                        <b>Fecha de Afiliación</b>
                        <input type="date" 
                            name="fecha_de_afiliacion"
                            value={history.fecha_de_afiliacion ? history.fecha_de_afiliacion : ''}
                            onChange={this.handleInput}
                            disabled={!this.props.edit}
                        />
                    </Form.Field>

                    <Form.Field
                        control={Input}
                        label={<b>Perfil Laboral</b>}
                        name="perfil_laboral"
                        value={history.perfil_laboral}
                        onChange={this.handleSelect}
                        disabled={!this.props.edit}
                        error={errors.perfil_laboral && errors.perfil_laboral[0]}
                    />

                    <Form.Field>
                        <b>Ext. Presupuestal</b>
                        <Select
                            options={parseOptions(cargos, ['sel-cargo', '', 'Select. Cargo'], ['id', 'id', 'ext_pptto'])}
                            placeholder="Select. Cargo"
                            value={history.cargo_id}
                            disabled
                        />
                    </Form.Field>

                    <Form.Field>
                        <b>Prima Seguros</b>
                        <Select
                            options={[
                                {key: "n", value: 0, text: "No Afecto"},
                                {key: "a", value: 1, text: "Afecto"}
                            ]}
                            placeholder="Select. Prima Seguro"
                            value={history.prima_seguro & history.prima_seguro}
                            name="prima_seguro"
                            onChange={this.handleSelect}
                            disabled={!this.props.edit}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-3">
                    <Form.Field>
                        <b>N° Autogenerado</b>
                        <input type="text" 
                            name="numero_de_essalud"
                            value={history.numero_de_essalud ? history.numero_de_essalud : ''}
                            onChange={this.handleInput}
                            disabled={!this.props.edit}
                        />
                    </Form.Field>

                    <Form.Field>
                        <b>Plaza</b>
                        <input type="text" 
                            name="plaza"
                            value={history.plaza ? history.plaza : ''}
                            onChange={this.handleInput}
                            disabled={!this.props.edit}
                        />
                    </Form.Field>

                    <Form.Field>
                        <b>P.A.P</b>
                        <Select
                            options={storage.pap}
                            placeholder="Select. P.A.P"
                            value={history.pap}
                            name="pap"
                            onChange={this.handleSelect}
                            disabled={!this.props.edit}
                        />
                    </Form.Field>

                    <Form.Field>
                        <b>Tipo Categoría</b>
                        <input type="text"
                            disabled={true}
                            name="type_categoria_id"
                            defaultValue={history.type_categoria && history.type_categoria.descripcion}
                        />
                    </Form.Field>
                </div>

                <div className="col-md-9 mt-2">
                    <Form.Field>
                        <Form.Field
                            control={TextArea}
                            label={<b>Observación <span className="text-red">*</span></b>}
                            name="observacion"  
                            rows="8"
                            style={{width: "100%"}}
                            value={history.observacion ? history.observacion : ''}
                            onChange={this.handleSelect}
                            disabled={!this.props.edit}
                            onChange={this.handleInput}
                            disabled={!this.props.edit}
                            error={errors.observacion && errors.observacion[0]}
                        />
                    </Form.Field>
                </div>

                {/* Render tools */}
                <ConsultaIframe 
                    isClose={(e) => this.setState({ ssp: 'none' })}
                    display={this.state.ssp}
                    titulo="Consulta al Sistema Privado de Pensiones"
                    url="https://www2.sbs.gob.pe/afiliados/paginas/Consulta.aspx"
                />
                <ConsultaIframe 
                    isClose={(e) => this.setState({ essalud: 'none' })}
                    md="8"
                    display={this.state.essalud}
                    titulo="Consulta al Sistema de  Essalud"
                    url="http://ww4.essalud.gob.pe:7777/acredita/"
                />
            </Form>
        )
    }

}
