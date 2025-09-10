"use client";

import { useState, useMemo } from 'react';
import { PlusCircleIcon, TrashIcon, PrinterIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

const novoItemProduto = () => ({
  id: Date.now() + Math.random(),
  codigo: '',
  estoqueAnterior: '',
  custoAnterior: '',
  quantidadeNota: '',
  custoNota: '',
  icms: '',
  ipi: '',
});

const FormNovoProduto = ({ onAddProduto }) => {
  const [produto, setProduto] = useState({ codigo: '', estoqueAnterior: '', custoAnterior: '' });

  const handleChange = (field, value) => {
    setProduto(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!produto.codigo || produto.estoqueAnterior === '' || produto.custoAnterior === '') {
      alert('Preencha todos os campos do produto.');
      return;
    }
    onAddProduto({
      ...produto,
      estoqueAnterior: parseFloat(produto.estoqueAnterior),
      custoAnterior: parseFloat(produto.custoAnterior)
    });
    setProduto({ codigo: '', estoqueAnterior: '', custoAnterior: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">1. Adicionar Produto ao Cálculo</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Código ou Nome" placeholder="Ex: PROD001" value={produto.codigo} onChange={e => handleChange('codigo', e.target.value)} />
        <Input label="Estoque Anterior" type="number" placeholder="0" value={produto.estoqueAnterior} onChange={e => handleChange('estoqueAnterior', e.target.value)} />
        <Input label="Custo Anterior" type="number" placeholder="0.00" value={produto.custoAnterior} onChange={e => handleChange('custoAnterior', e.target.value)} prefix="R$" />
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
    setProdutos(prev => [...prev, { id: Date.now(), ...novoProduto, quantidadeNota: '', custoNota: '', icms: '', ipi: '' }]);
  };

  const handleProdutoChange = (id, field, value) => {
    setProdutos(produtos.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleRemoveProduto = (id) => {
    setProdutos(produtos.filter(p => p.id !== id));
  };

  const { resultadosCalculados, totalItensNota, diferencaTotal } = useMemo(() => {
    let somaTotalItens = 0;

    const resultadosIniciais = produtos.map(item => {
      const quantidadeNota = parseFloat(item.quantidadeNota) || 0;
      const custoNota = parseFloat(item.custoNota) || 0;
      const icms = parseFloat(item.icms) || 0;
      const ipi = parseFloat(item.ipi) || 0;

      const custoTotalItemNota = quantidadeNota * custoNota;
      const valorIcms = custoTotalItemNota * (icms / 100);
      const valorIpi = custoTotalItemNota * (ipi / 100);
      const custoFinalItemBruto = custoTotalItemNota + valorIcms + valorIpi;
      
      somaTotalItens += custoFinalItemBruto;

      return { ...item, custoFinalItemBruto };
    });

    const valorTotalNotaNum = parseFloat(dadosNota.valorNota) || 0;
    const valorPagoNum = parseFloat(dadosNota.valorPago) || 0;
    const diferencaBonificacao = (valorPagoNum > 0 && valorPagoNum < valorTotalNotaNum) ? valorTotalNotaNum - valorPagoNum : 0;

    const resultadosFinais = resultadosIniciais.map(item => {
      const { estoqueAnterior, custoAnterior, quantidadeNota, custoFinalItemBruto } = item;
      
      let descontoProporcional = 0;
      if (diferencaBonificacao > 0 && somaTotalItens > 0) {
        const proporcaoItem = custoFinalItemBruto / somaTotalItens;
        descontoProporcional = diferencaBonificacao * proporcaoItem;
      }
      
      const custoFinalItemComDesconto = custoFinalItemBruto - descontoProporcional;
      const valorTotalEstoqueAnterior = (parseFloat(estoqueAnterior) || 0) * (parseFloat(custoAnterior) || 0);
      const estoqueFinal = (parseFloat(estoqueAnterior) || 0) + (parseFloat(quantidadeNota) || 0);
      const valorTotalFinal = valorTotalEstoqueAnterior + custoFinalItemComDesconto;
      const novoCustoMedio = estoqueFinal > 0 ? valorTotalFinal / estoqueFinal : 0;

      return { ...item, novoCustoMedio, estoqueFinal };
    });

    return {
      resultadosCalculados: resultadosFinais,
      totalItensNota: somaTotalItens,
      diferencaTotal: valorTotalNotaNum - somaTotalItens
    };
  }, [produtos, dadosNota]);

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  const dataRelatorio = new Date().toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short'});

  return (
    <div className="w-full space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FormNovoProduto onAddProduto={handleAddProduto} />
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">2. Dados Gerais da Nota</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Valor Total da NF-e" type="number" placeholder="0.00" value={dadosNota.valorNota} onChange={e => setDadosNota({ ...dadosNota, valorNota: e.target.value })} prefix="R$" />
            <Input label="Valor a Pagar" type="number" placeholder="0.00" value={dadosNota.valorPago} onChange={e => setDadosNota({ ...dadosNota, valorPago: e.target.value })} prefix="R$" />
            <Input label="Frete / Outros (CFOP)" type="number" placeholder="0.00" value={dadosNota.valorCfop} onChange={e => setDadosNota({ ...dadosNota, valorCfop: e.target.value })} prefix="R$" />
          </div>
          {parseFloat(dadosNota.valorNota) > 0 && (
            <div className={`mt-4 text-sm p-2 rounded-md flex items-center gap-2 ${Math.abs(diferencaTotal) < 0.01 ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>
              <span className={`h-2 w-2 rounded-full ${Math.abs(diferencaTotal) < 0.01 ? 'bg-green-500' : 'bg-red-500'}`}></span>
              Total dos itens: {formatCurrency(totalItensNota)}. Diferença: {formatCurrency(diferencaTotal)}.
            </div>
          )}
        </div>
      </div>
      
      <section className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">3. Itens da Nota e Resultados</h2>
          <button onClick={() => window.print()} className="flex items-center gap-2 text-sm font-semibold bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors self-start sm:self-center">
            <PrinterIcon className="h-5 w-5" />
            Imprimir / Salvar PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          {produtos.length === 0 ? (
            <p className="text-center py-10 text-zinc-500 dark:text-zinc-400">Adicione um produto para começar.</p>
          ) : (
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead>
                <tr>
                  <Th>Produto</Th>
                  <Th>Qtd. Nota</Th>
                  <Th>Custo Nota</Th>
                  <Th>ICMS (%)</Th>
                  <Th>IPI (%)</Th>
                  <Th isResult>Total Item</Th>
                  <Th isResult>Novo Custo</Th>
                  <Th isResult>Estoque Final</Th>
                  <Th isAction></Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {resultadosCalculados.map(p => (
                  <tr key={p.id}>
                    <Td isFirst>{p.codigo} <br/> <span className="text-xs text-zinc-400">Est: {p.estoqueAnterior} | Custo Ant: {formatCurrency(p.custoAnterior)}</span></Td>
                    <Td><InputTable type="number" value={p.quantidadeNota} onChange={e => handleProdutoChange(p.id, 'quantidadeNota', e.target.value)} /></Td>
                    <Td><InputTable type="number" value={p.custoNota} onChange={e => handleProdutoChange(p.id, 'custoNota', e.target.value)} prefix="R$"/></Td>
                    <Td><InputTable type="number" value={p.icms} onChange={e => handleProdutoChange(p.id, 'icms', e.target.value)} /></Td>
                    <Td><InputTable type="number" value={p.ipi} onChange={e => handleProdutoChange(p.id, 'ipi', e.target.value)} /></Td>
                    <Td isResult>{formatCurrency(p.custoFinalItemBruto)}</Td>
                    <Td isResult isHighlight>{formatCurrency(p.novoCustoMedio)}</Td>
                    <Td isResult>{p.estoqueFinal}</Td>
                    <Td isAction><button onClick={() => handleRemoveProduto(p.id)} className="text-zinc-400 hover:text-red-500 transition-colors"><TrashIcon className="h-5 w-5"/></button></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <div id="printableArea" className="hidden print:block p-4">
          <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-300">
              <div className="flex items-center gap-4">
                <Image src="/favicon.ico" alt="Logo" width={40} height={40} />
                <h1 className="text-2xl font-bold text-gray-800">Relatório de Custo - Bruno Unky</h1>
              </div>
              <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">Data do Relatório</p>
                  <p className="text-sm text-gray-500">{dataRelatorio}</p>
              </div>
          </header>
          <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-gray-400">
                    <ThPrint>Produto</ThPrint>
                    <ThPrint>Estoque Ant.</ThPrint>
                    <ThPrint>Custo Ant.</ThPrint>
                    <ThPrint>Qtd. Nota</ThPrint>
                    <ThPrint>Custo Nota</ThPrint>
                    <ThPrint>Total Item NF</ThPrint>
                    <ThPrint isHighlight>Novo Custo Médio</ThPrint>
                    <ThPrint isHighlight>Estoque Final</ThPrint>
                </tr>
            </thead>
            <tbody>
                {resultadosCalculados.map(p => (
                    <tr key={p.id} className="border-b border-gray-200">
                        <TdPrint isFirst>{p.codigo}</TdPrint>
                        <TdPrint>{p.estoqueAnterior}</TdPrint>
                        <TdPrint>{formatCurrency(p.custoAnterior)}</TdPrint>
                        <TdPrint>{p.quantidadeNota}</TdPrint>
                        <TdPrint>{formatCurrency(p.custoNota)}</TdPrint>
                        <TdPrint>{formatCurrency(p.custoFinalItemBruto)}</TdPrint>
                        <TdPrint isHighlight>{formatCurrency(p.novoCustoMedio)}</TdPrint>
                        <TdPrint isHighlight>{p.estoqueFinal}</TdPrint>
                    </tr>
                ))}
            </tbody>
          </table>
          <footer className="mt-6 text-center text-xs text-gray-500">
             Relatório gerado por Calculaqui - desenvolvido por Bruno Unky Developer
          </footer>
      </div>
    </div>
  );
}

const Input = ({ label, type = 'text', value, onChange, placeholder, prefix, suffix }) => (
  <div>
    <label className="block mb-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</label>
    <div className="relative">
      {prefix && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 text-sm">{prefix}</span>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={`w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 text-sm ${prefix ? 'pl-9' : ''} ${suffix ? 'pr-9' : ''}`} />
      {suffix && <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 text-sm">{suffix}</span>}
    </div>
  </div>
);

const InputTable = ({ type = 'number', value, onChange, prefix }) => (
    <div className="relative">{prefix && <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-zinc-400 text-xs">{prefix}</span>}<input type={type} value={value} onChange={onChange} className={`w-24 bg-transparent dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${prefix ? 'pl-8' : ''}`} /></div>
);

const Th = ({ children, isResult, isAction }) => <th scope="col" className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isAction ? 'w-12' : ''} ${isResult ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-300'}`}>{children}</th>;
const Td = ({ children, isFirst, isResult, isAction, isHighlight }) => <td className={`px-4 py-3 whitespace-nowrap text-sm align-top ${isFirst ? 'font-semibold' : ''} ${isResult ? 'font-medium text-zinc-800 dark:text-zinc-200' : 'text-zinc-600 dark:text-zinc-300'} ${isAction ? 'text-center' : ''} ${isHighlight ? '!font-bold !text-blue-600 !dark:text-blue-400' : ''}`}>{children}</td>;

const ThPrint = ({children, isHighlight}) => <th className={`p-2 text-left font-bold text-gray-700 ${isHighlight ? 'bg-blue-50 text-blue-800' : 'bg-gray-100'}`}>{children}</th>
const TdPrint = ({children, isFirst, isHighlight}) => <td className={`p-2 text-gray-800 ${isFirst ? 'font-semibold' : ''} ${isHighlight ? 'font-bold text-blue-900' : ''}`}>{children}</td>