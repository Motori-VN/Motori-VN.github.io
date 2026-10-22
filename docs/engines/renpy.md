# 引擎 / Ren'Py

Motori的Ren'Py插件当前基于Ren'Py 8.6.0版本进行支持。

> [!WARNING]
> Motori当前对Ren'Py的导出支持是试验性的，未经过充分的测试与验证，可能存在未知的适配错误问题。

## 坐标系预设

Motori中默认配置了一套Ren'Py引擎的坐标系预设方案。

| 名称 | 文件名 | 说明 |
|------|-------|-----|
| Ren'Py (1920x1080) |20_renpy-1080p.json| 适配于使用1920x1080分辨率、且舞台锚点与各立绘锚点均假定为中心位置的Ren'Py项目 |

若需要其他分辨率的项目，可复制该坐标系预设并更名，修改其中的`screen.width`与`screen.height`属性值为实际值。

## 保留字ID

设置立绘ID时，需注意以下的Ren'Py保留字ID：

| ID | 说明 |
| ---| ----|
| master | 默认图层/主舞台对象。若存在，必须是顶层的、唯一的立绘，且必须是普通类型容器。详见下文说明。|
| 其他的Ren'Py指令名、保留字、默认对象命名 | 请自行避免使用 |


## 容器

以Ren'Py作为目标引擎时，容器仅能按照以下范式进行使用，否则可能无法生成对应指令，可能与Ren'Py引擎中实际支持的效果产生偏差。

### 主舞台对象

Ren'Py中具有一个默认图层对象`master`。您可以通过创建一个名为`master`的**普通类型**容器，且置于顶层，将其他**所有立绘**放置在该容器的内部，来模拟Ren'Py中的该对象。

您可以通过调整`master`容器的各变换参数来表示Ren'Py中`layer master`的变换，或该图层的未启用`perspective`属性的`camera`（即正交相机）。导出时将统一实现成camera指令。

### 透传容器

透传容器用于对引擎中作为独立立绘存在的多个立绘进行组合使用。您可以自由的进行使用。

### 层叠式图像/组合式立绘

Ren'Py中具有层叠式图像对象`layeredimage`。其具备差分切换能力，但不具备其他的更加完善的次立绘变换能力。

您可以通过普通类型或终末类型的容器来表示一个层叠式图像对象。

表示层叠式图像对象的容器内部的各层级子立绘，其变换帧仅允许激活不透明度（`alpha`）这唯一一个变换属性。且，不透明度参数不再被视为正常的表达，而会被视为属性切换信号。不透明度为0即视为差分切出。存在差分切换的子立绘将以其id作为attribute控制切换。

表示层叠式图像对象的容器内部，允许嵌套容器。但是，其嵌套的普通容器与终末容器禁止具有不透明度之外的变换参数。且，当一个普通容器内部的子立绘对象存在差分切换信号时，该容器将被视为一个group，其中所有子对象均视为差分、以其id作为attribute控制差分切换。

## 过渡算法

在以Ren'Py引擎作为目标时，您的变换帧仅当使用以下的过渡算法类型时，能够与Ren'Py中的效果正确对应：

| Motori key | UI 显示名 | Ren'Py warper | 匹配级别 |
|---|---|---|---|
| `''`（空） | 平方渐变(缓入缓出/默认) | `ease_quad` | 精确 |
| `easeIn` | 平方渐进(缓入) | `easeout_quad` | 精确 |
| `easeOut` | 平方渐出(缓出) | `easein_quad` | 精确 |
| `circIn` | 圆形缓入 | `easeout_circ` | 精确 |
| `circOut` | 圆形缓出 | `easein_circ` | 精确 |
| `linear` | 线性 | `linear` | 精确 |
| `sineInOut` | 正弦缓入缓出 | `ease` | 精确 |
| `sineIn` | 正弦缓入 | `easeout` | 精确 |
| `sineOut` | 正弦缓出 | `easein` | 精确 |
| `cubicInOut` | 三次缓入缓出 | `ease_cubic` | 精确 |
| `cubicIn` | 三次缓入 | `easeout_cubic` | 精确 |
| `cubicOut` | 三次缓出 | `easein_cubic` | 精确 |
| `quartInOut` | 四次缓入缓出 | `ease_quart` | 精确 |
| `quartIn` | 四次缓入 | `easeout_quart` | 精确 |
| `quartOut` | 四次缓出 | `easein_quart` | 精确 |
| `quintInOut` | 五次缓入缓出 | `ease_quint` | 精确 |
| `quintIn` | 五次缓入 | `easeout_quint` | 精确 |
| `quintOut` | 五次缓出 | `easein_quint` | 精确 |
| `expoInOut` | 指数缓入缓出 | `ease_expo` | 精确 |
| `expoIn` | 指数缓入 | `easeout_expo` | 精确 |
| `expoOut` | 指数缓出 | `easein_expo` | 精确 |
| `elasticInOut` | 弹性缓入缓出 | `ease_elastic` | 精确 |
| `elasticIn` | 弹性缓入 | `easeout_elastic` | 精确 |
| `elasticOut` | 弹性缓出 | `easein_elastic` | 精确 |
| `circInOutPenner` | 圆形缓入缓出(Penner 原版) | `ease_circ` | 精确 |
| `backInOutPenner` | 起止回弹(Penner 原版) | `ease_back` | 精确 |
| `backInPenner` | 起点回弹(Penner 原版) | `easeout_back` | 精确 |
| `backOutPenner` | 终点回弹(Penner 原版) | `easein_back` | 精确 |
| `bounceInOutPenner` | 起止弹跳(Penner 原版) | `ease_bounce` | 精确 | 
| `bounceInPenner` | 起点弹跳(Penner 原版) | `easeout_bounce` | 精确 |
| `bounceOutPenner` | 终点弹跳(Penner 原版) | `easein_bounce` | 精确 |

由于Motori中的过渡算法及其命名在前期参考WebGAL引擎、使用了popmotion库中的定义，与通用的Penner公式在部分参数、以及In/Out定义上存在差距，Motori中的以下过渡变换效果和Ren'Py中的变换无法精确对齐、仅为近似效果：

| Motori key | UI 显示名 | Ren'Py warper | 匹配级别 | 说明 |
|---|---|---|---|---|
| `circInOut` | 圆形缓入缓出 | `ease_circ` | 近似 | Motori = `mirror(circOut)`，引擎 = `mirror(circIn)`，镜像方向相反；精确替代键 `circInOutPenner` |
| `backInOut` | 起止回弹 | `ease_back` | 近似 | popmotion s=1.525 vs 引擎 1.7015；精确替代键 `backInOutPenner` |
| `backIn` | 起点回弹 | `easeout_back` | 近似 | 同上；精确替代键 `backInPenner` |
| `backOut` | 终点回弹 | `easein_back` | 近似 | 同上；精确替代键 `backOutPenner` |
| `bounceInOut` | 起止弹跳 | `ease_bounce` | 近似 | popmotion 分段系数 vs 引擎标准 Penner 分段（p=2.75）；精确替代键 `bounceInOutPenner` |
| `bounceIn` | 起点弹跳 | `easeout_bounce` | 近似 | 同上；精确替代键 `bounceInPenner` |
| `bounceOut` | 终点弹跳 | `easein_bounce` | 近似 | 同上；精确替代键 `bounceOutPenner` |

以下过渡算法在Ren'Py中无定义。

| Motori key | UI 显示名 | 匹配级别 |
|---|---|---|---|
| `anticipate` | 预先反向 | **无对应** |

## 透视相机

Ren'Py引擎具有原生的透视相机支持。

若要使用透视相机，您仅能挂载在主舞台对象`master`之上。

由于Ren'Py与Motori在透视相机挂载上的实现差异，当前Motori向Ren'Py的相机映射、指令导出中，**透视相机模式与正交相机模式暂时互斥。**挂载透视相机时，主舞台对象`master`**禁止设置任何变换，禁止调整初始值。**

Ren'Py的透视相机不具备FOV实时调整/镜头缩放功能。您在使用中不得进行任何的、可能使相机FOV偏离初始值的FOV变换。

**请启用“透视变形预览”功能。**

| 透视相机参数 | 导出支持情况 |
| ----------- | ----------- |
| 平移X | 原生支持 |
| 平移Y | 原生支持 |
| 偏航 | 原生支持/有画面扭曲 |
| 俯仰 | 原生支持/有画面扭曲 | 
| 推拉 | 原生支持 | 
| FOV(初始) | 原生支持 |
| FOV(缩放) | **不支持** |


## 时间轴

**强烈不建议**您将0:00.000作为连续的变换序列的开始点。

推荐您将时间轴开始的一段时间留空，或安置序列开始前的、初始的Live2D动作与表情，用于布置序列开始前的状态，方便编排符合实际的舞台变换序列，以及生成对应的初始登场或初始变换指令。

## Live2D支持

Ren'Py支持Live2D Cubism 3以上版本模型的显示。Ren'Py不支持Live2D立绘的物理效果，且动作切换过渡的展示与Motori中可能存在一定差异

Ren'Py**不支持**Live2D Cubism 2模型的显示。以Ren'Py作为导出目标时，请勿使用Live2D Cubism 2立绘。

Ren'Py**不支持**Live2D立绘的显示边界设置。以Ren'Py作为导出目标时，请勿使用该功能。

## 导出指令

### 立绘定义

生成相应的立绘image和layeredimage对象定义指令。Ren'Py中，Live2D对象、以及层叠式图像对象，必须通过指令预先定义。

### 仅登场

为选中立绘生成对应的scene和show命令，用于**立绘的入场**。该指令可以改变已入场的立绘或背景的变换参数。

### 变换序列

为选中对象生成scene命令，show命令，与pause命令的组合。

通过scene命令或show命令，生成涵盖整个选中时间区间的变换动画序列。

通过show命令与pause命令的组合，控制Live2D动作与表情的切换序列。注意，这可能会对您在Ren'Py引擎中的、同期的其他指令，特别是对话语句的使用产生影响。

变换序列模式**假定相应对象在执行这些生成的指令前已经入场、且处于序列开始时的状态**。理论上应当也可用于立绘的入场，但或可能造成与Motori中的显示效果的差异。