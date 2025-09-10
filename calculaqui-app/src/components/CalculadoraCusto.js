"use client";

import { useState, useMemo } from 'react';
import { PlusCircleIcon, TrashIcon, PrinterIcon } from '@heroicons/react/24/outline';

const FormNovoProduto = ({ onAddProduto }) => {
  const [codigo, setCodigo] = useState('');
  const [estoqueAnterior, setEstoqueAnterior] = useState('');
  const [custoAnterior, setCustoAnterior] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!codigo || estoqueAnterior < 0 || custoAnterior < 0) {
      alert('Preencha todos os campos do produto corretamente.');
      return;
    }
    onAddProduto({ codigo, estoqueAnterior: parseFloat(estoqueAnterior), custoAnterior: parseFloat(custoAnterior) });
    setCodigo('');
    setEstoqueAnterior('');
    setCustoAnterior('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">1. Adicionar Produto ao Cálculo</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Código ou Nome" placeholder="Ex: PROD001" value={codigo} onChange={e => setCodigo(e.target.value)} />
        <Input label="Estoque Anterior" type="number" placeholder="0" value={estoqueAnterior} onChange={e => setEstoqueAnterior(e.target.value)} />
        <Input label="Custo Anterior" type="number" placeholder="0.00" value={custoAnterior} onChange={e => setCustoAnterior(e.target.value)} prefix="R$" />
      </div>
      <button type="submit" className="mt-4 flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors py-2 px-4 rounded-lg">
        <PlusCircleIcon className="h-5 w-5" />
        Adicionar à Lista
      </button>
    </form>
  );
};


export default function CalculadoraCusto() {
  const [produtos, setProdutos] = useState([]);
  const [dadosNota, setDadosNota] = useState({ valorNota: '', valorPago: '', valorCfop: '' });

  const handleAddProduto = (novoProduto) => {
    setProdutos(prev => [
      ...prev,
      {
        id: Date.now(),
        ...novoProduto,
        quantidadeNota: '',
        custoNota: '',
        icms: '',
        ipi: '',
      }
    ]);
  };

  const handleProdutoChange = (id, field, value) => {
    setProdutos(produtos.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleRemoveProduto = (id) => {
    setProdutos(produtos.filter(p => p.id !== id));
  };

  const resultadosCalculados = useMemo(() => {
    return produtos.map(item => {
      const estoqueAnterior = parseFloat(item.estoqueAnterior) || 0;
      const custoAnterior = parseFloat(item.custoAnterior) || 0;
      const quantidadeNota = parseFloat(item.quantidadeNota) || 0;
      const custoNota = parseFloat(item.custoNota) || 0;
      const icms = parseFloat(item.icms) || 0;
      const ipi = parseFloat(item.ipi) || 0;

      const valorTotalEstoqueAnterior = estoqueAnterior * custoAnterior;
      const custoTotalItemNota = quantidadeNota * custoNota;
      const valorIcms = custoTotalItemNota * (icms / 100);
      const valorIpi = custoTotalItemNota * (ipi / 100);
      
      const custoFinalItem = custoTotalItemNota + valorIcms + valorIpi;
      
      const estoqueFinal = estoqueAnterior + quantidadeNota;
      const valorTotalFinal = valorTotalEstoqueAnterior + custoFinalItem;
      
      const novoCustoMedio = estoqueFinal > 0 ? valorTotalFinal / estoqueFinal : 0;

      return { ...item, novoCustoMedio, estoqueFinal };
    });
  }, [produtos]);

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  return (
    <div className="w-full space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FormNovoProduto onAddProduto={handleAddProduto} />
        
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">2. Dados Gerais da Nota</h2>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Valor Total da NF-e" type="number" placeholder="0.00" value={dadosNota.valorNota} onChange={e => setDadosNota({...dadosNota, valorNota: e.target.value})} prefix="R$" />
            <Input label="Valor a Pagar" type="number" placeholder="0.00" value={dadosNota.valorPago} onChange={e => setDadosNota({...dadosNota, valorPago: e.target.value})} prefix="R$" />
            <Input label="Frete / Outros (CFOP)" type="number" placeholder="0.00" value={dadosNota.valorCfop} onChange={e => setDadosNota({...dadosNota, valorCfop: e.target.value})} prefix="R$" />
          </div>
        </div>
      </div>

      <section className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">3. Lista de Itens e Cálculo de Custo</h2>
          <button onClick={() => window.print()} className="flex items-center gap-2 text-sm font-semibold bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors self-start sm:self-center">
            <PrinterIcon className="h-5 w-5" />
            Imprimir / Salvar PDF
          </button>
        </div>

        <div id="printableArea" className="overflow-x-auto">
          {produtos.length === 0 ? (
            <p className="text-center py-10 text-zinc-500 dark:text-zinc-400">Adicione um produto no card acima para começar.</p>
          ) : (
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-100 dark:bg-zinc-800">
                <tr>
                  <Th>Produto</Th>
                  <Th>Qtd. Nota</Th>
                  <Th>Custo Nota</Th>
                  <Th>ICMS (%)</Th>
                  <Th>IPI (%)</Th>
                  <Th isResult>Novo Custo Médio</Th>
                  <Th isResult>Estoque Final</Th>
                  <Th isAction></Th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-700">
                {resultadosCalculados.map(p => (
                  <tr key={p.id}>
                    <Td isFirst>{p.codigo} <br/> <span className="text-xs text-zinc-400">Estoque: {p.estoqueAnterior} | Custo: {formatCurrency(p.custoAnterior)}</span></Td>
                    <Td><InputTable type="number" value={p.quantidadeNota} onChange={e => handleProdutoChange(p.id, 'quantidadeNota', e.target.value)} /></Td>
                    <Td><InputTable type="number" value={p.custoNota} onChange={e => handleProdutoChange(p.id, 'custoNota', e.target.value)} prefix="R$"/></Td>
                    <Td><InputTable type="number" value={p.icms} onChange={e => handleProdutoChange(p.id, 'icms', e.target.value)} /></Td>
                    <Td><InputTable type="number" value={p.ipi} onChange={e => handleProdutoChange(p.id, 'ipi', e.target.value)} /></Td>
                    <Td isResult>{formatCurrency(p.novoCustoMedio)}</Td>
                    <Td isResult>{p.estoqueFinal}</Td>
                    <Td isAction>
                      <button onClick={() => handleRemoveProduto(p.id)} className="text-zinc-400 hover:text-red-500 transition-colors">
                        <TrashIcon className="h-5 w-5"/>
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}


const Input = ({ label, type = 'text', value, onChange, placeholder, prefix, suffix }) => (
  <div>
    <label className="block mb-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</label>
    <div className="relative">
      {prefix && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 text-sm">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 text-sm ${prefix ? 'pl-9' : ''} ${suffix ? 'pr-9' : ''}`}
      />
      {suffix && <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 text-sm">{suffix}</span>}
    </div>
  </div>
);

const InputTable = ({ type = 'number', value, onChange, prefix }) => (
    <div className="relative">
        {prefix && <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-zinc-400 text-xs">{prefix}</span>}
        <input 
            type={type}
            value={value}
            onChange={onChange}
            className={`w-24 bg-transparent dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${prefix ? 'pl-8' : ''}`}
        />
    </div>
);

const Th = ({ children, isResult = false, isAction = false }) => <th scope="col" className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isAction ? 'w-12' : ''} ${isResult ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-300'}`}>{children}</th>;
const Td = ({ children, isFirst = false, isResult = false, isAction = false }) => <td className={`px-4 py-4 whitespace-nowrap text-sm align-top ${isFirst ? 'font-semibold' : ''} ${isResult ? 'font-semibold text-zinc-800 dark:text-zinc-200' : 'text-zinc-600 dark:text-zinc-300'} ${isAction ? 'text-center' : ''}`}>{children}</td>;